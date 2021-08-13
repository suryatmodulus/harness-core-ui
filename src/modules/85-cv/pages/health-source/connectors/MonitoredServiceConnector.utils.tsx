import React from 'react'
import { Button, Text, Layout, Color, IconName, SelectOption } from '@wings-software/uicore'
import isEmpty from 'lodash-es/isEmpty'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import {
  AppdynamicsValidationResponse,
  getNewRelicMetricDataPromise,
  getAppDynamicsMetricDataPromise,
  GetNewRelicMetricDataQueryParams,
  GetAppDynamicsMetricDataQueryParams,
  MetricPackDTO,
  MetricPackDTOArrayRequestBody,
  MetricPackValidationResponse,
  ResponseMetricPackValidationResponse,
  ResponseSetAppdynamicsValidationResponse
} from 'services/cv'
import {
  ValidationStatus,
  StatusState,
  HealthSoureSupportedConnectorTypes
} from './MonitoredServiceConnector.constants'
import type { UpdatedHealthSource } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'
import css from './NewRelic/NewrelicMonitoredSource.module.scss'

export const createPayloadByConnectorType = (formData: any, connector: string): UpdatedHealthSource | null => {
  let type = null
  let specPayload = {}
  switch (connector) {
    case HealthSoureSupportedConnectorTypes.APP_DYNAMICS:
      type = 'AppDynamics' as any
      specPayload = {
        applicationName: formData.appdApplication as string,
        tierName: formData.appDTier as string
      }
      break
    case HealthSoureSupportedConnectorTypes.NEW_RELIC:
      type = 'NewRelic' as any
      specPayload = {
        applicationName: formData?.newRelicApplication?.label,
        applicationId: formData?.newRelicApplication?.value
      }
      break
    default:
      return null
  }

  const healthSourcesPayload = {
    name: formData.name || (formData.healthSourceName as string),
    identifier: formData.identifier || (formData.healthSourceIdentifier as string),
    type,
    spec: {
      ...specPayload,
      feature: formData.product?.value as string,
      connectorRef: (formData?.connectorRef?.connector?.identifier as string) || (formData.connectorRef as string),
      metricPacks: Object.entries(formData.metricData)
        .map(item => {
          return item[1]
            ? {
                identifier: item[0]
              }
            : {}
        })
        .filter(item => !isEmpty(item))
    }
  }

  return healthSourcesPayload
}

export const InputIcon = ({ icon, onClick }: { icon: IconName; onClick?: () => void }): React.ReactElement => (
  <Button
    minimal
    icon={icon}
    iconProps={{ size: 15 }}
    onClick={onClick}
    margin={{ right: 'xsmall' }}
    className={css.iconButton}
  />
)

export const getInputGroupProps = (onClick: () => void) => {
  return {
    inputGroup: {
      leftElement: <InputIcon icon={'search'} />,
      rightElement: <InputIcon icon={'cross'} onClick={onClick} />
    }
  }
}

export const getOptions = (
  loading: boolean,
  data: any,
  connector: string,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  if (!data) return []
  return loading
    ? [{ label: getString('loading'), value: '' }]
    : data.map((item: any) => {
        if (HealthSoureSupportedConnectorTypes.NEW_RELIC === connector) {
          return { value: item.applicationId as unknown as string, label: item.applicationName as string }
        } else {
          return { value: item.id as unknown as string, label: item.name as string }
        }
      }) || []
}

export const createMetricDataFormik = (metricPacks: MetricPackDTO[]): { [key: string]: boolean } => {
  const metricData: { [key: string]: boolean } = {}
  metricPacks.forEach((i: MetricPackDTO) => (metricData[i.identifier as string] = true))
  return metricData
}

export async function validateMetrics(
  metricPacks: MetricPackDTOArrayRequestBody,
  queryParams: GetAppDynamicsMetricDataQueryParams | GetNewRelicMetricDataQueryParams,
  connector: string
): Promise<{ validationStatus: string | undefined; validationResult?: AppdynamicsValidationResponse[]; error?: any }> {
  try {
    let response: ResponseMetricPackValidationResponse | ResponseSetAppdynamicsValidationResponse | null = null
    let data: AppdynamicsValidationResponse[] | null | undefined = null
    switch (connector) {
      case HealthSoureSupportedConnectorTypes.APP_DYNAMICS:
        if (queryParams) {
          const appDQueryParam = queryParams as GetAppDynamicsMetricDataQueryParams
          response = await getAppDynamicsMetricDataPromise({ queryParams: appDQueryParam, body: metricPacks })
          data = response?.data
        }
        break
      case HealthSoureSupportedConnectorTypes.NEW_RELIC:
        if (queryParams) {
          const newRelicQueryParam = queryParams as GetNewRelicMetricDataQueryParams
          response = await getNewRelicMetricDataPromise({ queryParams: newRelicQueryParam, body: metricPacks })
          data = response?.data && transformNewRelicDataToAppd(response?.data)
        }
        break
      default:
        break
    }

    if (response?.status === 'ERROR') {
      return { validationStatus: undefined, error: getErrorMessage({ data: response }) }
    }

    if (data?.length) {
      let status
      if (data?.some(val => val.overallStatus === StatusState.FAILED)) {
        status = ValidationStatus.ERROR
      } else if (data?.some(val => val.overallStatus === StatusState.NO_DATA)) {
        status = ValidationStatus.NO_DATA
      } else if (data?.every(val => val.overallStatus === StatusState.SUCCESS)) {
        status = ValidationStatus.SUCCESS
      }
      return { validationStatus: status, validationResult: data }
    }
    return { validationStatus: undefined }
  } catch (e) {
    return { validationStatus: undefined, error: getErrorMessage(e) }
  }
}

export const renderValidationStatus = (
  validationStatus: string,
  getString: UseStringsReturn['getString'],
  validationResultData: AppdynamicsValidationResponse[],
  setValidationResultData: (val: AppdynamicsValidationResponse[]) => void,
  onValidate: any
): JSX.Element | null => {
  const additionalProps = validationResultData
    ? {
        onClick: () => setValidationResultData(validationResultData),
        style: { cursor: 'pointer' }
      }
    : {}

  switch (validationStatus) {
    case ValidationStatus.IN_PROGRESS:
      return (
        <Text icon="steps-spinner" iconProps={{ size: 16 }}>
          {getString('cv.monitoringSources.appD.verificationsInProgress')}
        </Text>
      )
    case ValidationStatus.NO_DATA:
      return (
        <Text icon="issue" iconProps={{ size: 16 }} {...additionalProps}>
          {getString('cv.monitoringSources.appD.noData')}
        </Text>
      )
    case ValidationStatus.SUCCESS:
      return (
        <Text icon="tick" iconProps={{ size: 16, color: Color.GREEN_500 }} {...additionalProps}>
          {getString('cv.monitoringSources.appD.validationsPassed')}
        </Text>
      )
    case ValidationStatus.ERROR:
      return (
        <Layout.Horizontal spacing="small">
          <Text icon="warning-sign" iconProps={{ size: 16, color: Color.RED_500 }} {...additionalProps}>
            {getString('cv.monitoringSources.appD.validationsFailed')}
          </Text>
          <Button
            icon="refresh"
            iconProps={{ size: 12 }}
            color={Color.BLUE_500}
            text={getString('retry')}
            onClick={onValidate}
          />
        </Layout.Horizontal>
      )
    default:
      return null
  }
}

export function transformNewRelicDataToAppd(metricData: MetricPackValidationResponse): AppdynamicsValidationResponse[] {
  const appDMeticData: AppdynamicsValidationResponse = {
    overallStatus: metricData.overallStatus,
    metricPackName: metricData.metricPackName,
    values: []
  }
  for (const newRelicData of metricData.metricValidationResponses || []) {
    appDMeticData.values?.push({
      value: newRelicData.value,
      apiResponseStatus: newRelicData.status,
      metricName: newRelicData.metricName
    })
  }
  return [appDMeticData]
}

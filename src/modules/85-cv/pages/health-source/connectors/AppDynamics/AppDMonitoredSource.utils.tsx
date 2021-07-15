import React from 'react'
import { Button, Text, Layout, Color, IconName } from '@wings-software/uicore'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import {
  AppdynamicsValidationResponse,
  getAppDynamicsMetricDataPromise,
  GetAppDynamicsMetricDataQueryParams,
  MetricPackDTO,
  MetricPackDTOArrayRequestBody
} from 'services/cv'
import type { updatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent'
import css from './AppDMonitoredSource.module.scss'

export enum ValidationStatus {
  IN_PROGRESS = 'in-progress',
  NO_DATA = 'no-data',
  SUCCESS = 'success',
  ERROR = 'error'
}

const createAppDPayload = (formData: any): updatedHealthSource => {
  const healthSourcesPayload = {
    name: formData.healthSourceName as string,
    environment: formData.environmentIdentifier as string,
    service: formData.serviceIdentifier as string,
    identifier: formData.healthSourceidentifier as string,
    type: 'AppDynamics' as any,
    spec: {
      connectorRef: (formData?.connectorRef?.connector?.identifier as string) || (formData.connectorRef as string),
      feature: formData.product as string,
      appdApplicationName: formData.appdApplication as string,
      appdTierName: formData.appDTier as string,
      metricPacks: Object.entries(formData.metricAppD)
        .map(item => {
          // item [key , value] = ['Error', true]
          return item[1]
            ? {
                identifier: item[0] // 'Error': true
              }
            : {}
        })
        .filter(item => !!item)
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

export const getOptions = (loading: boolean, data: any, getString: UseStringsReturn['getString']) => {
  if (!data) return []
  return loading
    ? [{ label: getString('loading'), value: '' }]
    : data.map((item: any) => {
        return { value: item.id as unknown as string, label: item.name as string }
      }) || []
}

export const getAppDMetric = (isEdit: boolean, editPayload: MetricPackDTO[], createPayload: MetricPackDTO[]) => {
  const metricAppD: { [key: string]: any } = {}
  isEdit
    ? editPayload?.forEach((i: MetricPackDTO) => (metricAppD[i.identifier as string] = true))
    : createPayload?.forEach((i: MetricPackDTO) => (metricAppD[i.identifier as string] = true))
  return metricAppD
}

export const StatusState = {
  NO_DATA: 'NO_DATA',
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS'
}

export async function validateTier(
  metricPacks: MetricPackDTOArrayRequestBody,
  queryParams: GetAppDynamicsMetricDataQueryParams
): Promise<{ validationStatus: string | undefined; validationResult?: AppdynamicsValidationResponse[]; error?: any }> {
  try {
    const response = await getAppDynamicsMetricDataPromise({ queryParams, body: metricPacks })

    if (response.status === 'ERROR') {
      return { validationStatus: undefined, error: getErrorMessage({ data: response }) }
    }

    const { data } = response

    if (data?.length) {
      let status
      if (data.some(val => val.overallStatus === StatusState.FAILED)) {
        status = ValidationStatus.ERROR
      } else if (data.some(val => val.overallStatus === StatusState.NO_DATA)) {
        status = ValidationStatus.NO_DATA
      } else if (data.every(val => val.overallStatus === StatusState.SUCCESS)) {
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
            onClick={onValidate} // onValidate
          />
        </Layout.Horizontal>
      )
    default:
      return null
  }
}

export { createAppDPayload }

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Color,
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  SelectOption,
  Utils
} from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetAppDynamicsApplications,
  useGetMetricPacks,
  useGetAppDynamicsTiers,
  MetricPackDTO,
  AppdynamicsValidationResponse
} from 'services/cv'
import { Connectors } from '@connectors/constants'
import { PageError } from '@common/components/Page/PageError'
import { useToaster } from '@common/components/Toaster/useToaster'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  ValidationStatus,
  createAppDPayload,
  getOptions,
  validateTier,
  renderValidationStatus,
  getAppDMetric,
  getInputGroupProps
} from './AppDMonitoredSource.utils'
import { HealthSoureSupportedConnectorTypes } from '../connectors.util'
import css from './AppDMonitoredSource.module.scss'

export default function AppDMonitoredSource({
  data,
  onSubmit
}: {
  data: any
  onSubmit: (formdata: any, healthSourcePayload: any) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const [validationResultData, setValidationResultData] = useState<AppdynamicsValidationResponse[]>()
  const [appDValidation, setAppDValidation] = useState<{
    status: string
    result: AppdynamicsValidationResponse[] | []
  }>({
    status: '',
    result: []
  })
  const [guidMap, setGuidMap] = useState(new Map())
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = data?.connectorRef?.connector?.identifier || data?.connectorRef
  const {
    data: metricPacks,
    refetch: refetchMetricPacks,
    error: metricPackError
  } = useGetMetricPacks({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      dataSourceType: HealthSoureSupportedConnectorTypes.APP_DYNAMICS
    }
  })
  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError
  } = useGetAppDynamicsApplications({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000,
      filter: ''
    }
  })

  const {
    data: tierData,
    loading: tierLoading,
    refetch: refetchTier,
    error: tierError
  } = useGetAppDynamicsTiers({
    lazy: true
  })

  useEffect(() => {
    if (data?.appdApplicationName) {
      refetchTier({
        queryParams: {
          appName: data?.appdApplicationName,
          accountId,
          connectorIdentifier,
          orgIdentifier,
          projectIdentifier,
          offset: 0,
          pageSize: 10000,
          filter: ''
        }
      })
    }
  }, [data?.appdApplicationName])

  const onValidate = async (appName: string, tierName: string, metricObject: { [key: string]: any }): Promise<void> => {
    setAppDValidation({ status: ValidationStatus.IN_PROGRESS, result: [] })
    const filteredMetricPack = metricPacks?.resource?.filter(item => metricObject[item.identifier as string])
    const guid = Utils.randomId()
    setGuidMap(oldMap => {
      oldMap.set(tierName, guid)
      return new Map(oldMap)
    })
    const { validationStatus, validationResult } = await validateTier(filteredMetricPack || [], {
      accountId,
      appName: appName,
      tierName: tierName,
      connectorIdentifier: connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      requestGuid: guid
    })
    setAppDValidation({
      status: validationStatus as string,
      result: validationResult as AppdynamicsValidationResponse[]
    })
  }

  if (applicationError || tierError) {
    clear()
    tierError && showError(tierError?.message)
    applicationError && showError(applicationError?.message)
  }

  const applicationOptions: SelectOption[] = useMemo(
    () => getOptions(applicationLoading, applicationsData?.data?.content, getString),
    [applicationsData?.data?.content]
  )

  const tierOptions: SelectOption[] = useMemo(
    () => getOptions(tierLoading, tierData?.data?.content, getString),
    [tierData?.data?.content]
  )
  const metricAppD: { [key: string]: any } = useMemo(
    () => getAppDMetric(data?.isEdit, data?.metricPacks, metricPacks?.resource as MetricPackDTO[]),
    [data?.metricPacks, metricPacks?.resource]
  )

  const initPayload = {
    ...data,
    appdApplication: data?.appdApplicationName || '',
    appDTier: data?.appdTierName || '',
    metricAppD
  }

  useEffect(() => {
    if (data.isEdit && appDValidation.status !== ValidationStatus.IN_PROGRESS) {
      onValidate(data?.appdApplicationName, data?.appdTierName, metricAppD)
    }
  }, [tierLoading, data.isEdit])

  return (
    <Formik
      enableReinitialize
      formName={'appDHealthSourceform'}
      validationSchema={Yup.object().shape({
        appDTier: Yup.string().required(getString('cv.healthSource.connectors.AppDynamics.validation.tier')),
        appdApplication: Yup.string().required(
          getString('cv.healthSource.connectors.AppDynamics.validation.application')
        )
      })}
      initialValues={initPayload}
      onSubmit={async values => {
        const appDPayload = createAppDPayload(values)
        await onSubmit(values, appDPayload)
      }}
    >
      {formik => {
        return (
          <FormikForm className={css.formFullheight}>
            <CardWithOuterTitle title={getString('cv.healthSource.connectors.AppDynamics.applicationsAndTiers')}>
              <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                  <FormInput.Select
                    className={css.applicationDropdown}
                    onChange={item => {
                      refetchTier({
                        queryParams: {
                          appName: item.label.toString(),
                          accountId,
                          connectorIdentifier,
                          orgIdentifier,
                          projectIdentifier,
                          offset: 0,
                          pageSize: 10000
                        }
                      })
                      formik.setFieldValue('appdApplication', item.label)
                      setAppDValidation({ status: '', result: [] })
                    }}
                    value={
                      !formik?.values?.appdApplication
                        ? { label: '', value: '' }
                        : applicationOptions.find(
                            (item: SelectOption) => item.label === formik?.values?.appdApplication
                          )
                    }
                    name={'appdApplication'}
                    placeholder={
                      applicationLoading
                        ? getString('loading')
                        : getString('cv.healthSource.connectors.AppDynamics.applicationPlaceholder')
                    }
                    items={applicationOptions}
                    label={getString('cv.healthSource.connectors.AppDynamics.applicationLabel')}
                    {...getInputGroupProps(() => formik.setFieldValue('appdApplication', ''))}
                  />
                </Container>
                {!!formik.values.appdApplication && (
                  <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                    <FormInput.Select
                      className={css.tierDropdown}
                      name={'appDTier'}
                      placeholder={
                        tierLoading
                          ? getString('loading')
                          : getString('cv.healthSource.connectors.AppDynamics.tierPlaceholder')
                      }
                      value={
                        tierLoading || !formik?.values?.appDTier
                          ? { label: '', value: '' }
                          : tierOptions.find((item: SelectOption) => item.label === formik?.values?.appDTier)
                      }
                      onChange={async item => {
                        formik.setFieldValue('appDTier', item.label)
                        await onValidate(formik.values.appdApplication, item.value as string, formik.values.metricAppD)
                      }}
                      items={tierOptions}
                      label={getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
                      {...getInputGroupProps(() => formik.setFieldValue('appDTier', ''))}
                    />
                  </Container>
                )}
                <Container width={'300px'} color={Color.BLACK}>
                  {formik?.values?.appDTier &&
                    formik?.values?.appdApplication &&
                    renderValidationStatus(
                      appDValidation.status,
                      getString,
                      appDValidation.result,
                      setValidationResultData,
                      () =>
                        onValidate(
                          formik?.values?.appdApplication,
                          formik?.values?.appDTier,
                          formik?.values?.metricAppD
                        )
                    )}
                </Container>
              </Layout.Horizontal>
            </CardWithOuterTitle>
            <CardWithOuterTitle title={getString('metricPacks')}>
              <Layout.Vertical>
                <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
                <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                  <Container className={css.metricPack}>
                    {metricPacks?.resource?.map(mp => (
                      <FormInput.CheckBox
                        name={`metricAppD.${mp.identifier}`}
                        key={mp.identifier}
                        label={mp.identifier || ''}
                        onChange={async val => {
                          const metricData = {
                            ...formik?.values?.metricAppD,
                            [mp.identifier as string]: val.currentTarget.checked
                          }
                          await onValidate(
                            formik?.values?.appdApplication,
                            formik?.values?.appDTier as string,
                            metricData
                          )
                        }}
                      />
                    ))}
                  </Container>
                  {metricPackError && (
                    <PageError message={getErrorMessage(metricPackError)} onClick={() => refetchMetricPacks()} />
                  )}
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guidMap.get(formik?.values?.appdTierName)}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.APP_DYNAMICS}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            <DrawerFooter isSubmit onPrevious={() => onPrevious(formik.values)} onNext={formik.submitForm} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

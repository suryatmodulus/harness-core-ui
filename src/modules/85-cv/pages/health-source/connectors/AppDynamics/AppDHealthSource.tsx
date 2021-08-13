import React, { useEffect, useMemo, useState } from 'react'
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
  useGetAppDynamicsTiers,
  MetricPackDTO,
  AppdynamicsValidationResponse
} from 'services/cv'
import { Connectors } from '@connectors/constants'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import {
  getOptions,
  getInputGroupProps,
  renderValidationStatus,
  validateMetrics,
  createMetricDataFormik
} from '../MonitoredServiceConnector.utils'

import MetricPack from '../MetrickPack'
import { ValidationStatus } from '../MonitoredServiceConnector.constants'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import css from './AppDHealthSource.module.scss'

export default function AppDMonitoredSource({
  data,
  onSubmit,
  onPrevious
}: {
  data: any
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])
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
    if (data?.applicationName) {
      refetchTier({
        queryParams: {
          appName: data?.applicationName,
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
  }, [data?.applicationName])

  const onValidate = async (appName: string, tierName: string, metricObject: { [key: string]: any }): Promise<void> => {
    setAppDValidation({ status: ValidationStatus.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks.filter(item => metricObject[item.identifier as string])
    const guid = Utils.randomId()
    setGuidMap(oldMap => {
      oldMap.set(tierName, guid)
      return new Map(oldMap)
    })
    const { validationStatus, validationResult } = await validateMetrics(
      filteredMetricPack || [],
      {
        accountId,
        appName: appName,
        tierName: tierName,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      },
      HealthSoureSupportedConnectorTypes.APP_DYNAMICS
    )
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
    () =>
      getOptions(
        applicationLoading,
        applicationsData?.data?.content,
        HealthSoureSupportedConnectorTypes.APP_DYNAMICS,
        getString
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  const tierOptions: SelectOption[] = useMemo(
    () => getOptions(tierLoading, tierData?.data?.content, HealthSoureSupportedConnectorTypes.APP_DYNAMICS, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tierLoading]
  )

  const initPayload = {
    ...data,
    appdApplication: data?.applicationName || '',
    appDTier: data?.tierName || ''
  }

  useEffect(() => {
    if (data.isEdit && selectedMetricPacks.length && appDValidation.status !== ValidationStatus.IN_PROGRESS) {
      onValidate(data?.applicationName, data?.tierName, createMetricDataFormik(data?.metricPacks))
    }
  }, [selectedMetricPacks, tierLoading, data.isEdit])

  return (
    <Formik
      enableReinitialize
      formName={'appDHealthSourceform'}
      validate={values => {
        const metricValueList = Object.values(values?.metricData).filter(val => val)
        if (!metricValueList.length) {
          return { metricData: getString('cv.monitoringSources.appD.validations.selectMetricPack') }
        }
      }}
      validationSchema={Yup.object().shape({
        appDTier: Yup.string().required(getString('cv.healthSource.connectors.AppDynamics.validation.tier')),
        appdApplication: Yup.string().required(
          getString('cv.healthSource.connectors.AppDynamics.validation.application')
        )
      })}
      initialValues={initPayload}
      onSubmit={async values => {
        await onSubmit(values)
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
                        await onValidate(formik.values.appdApplication, item.label as string, formik.values.metricData)
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
                          formik?.values?.metricData
                        )
                    )}
                </Container>
              </Layout.Horizontal>
            </CardWithOuterTitle>
            <CardWithOuterTitle title={getString('metricPacks')}>
              <Layout.Vertical>
                <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
                <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                  <MetricPack
                    formik={formik}
                    setSelectedMetricPacks={setSelectedMetricPacks}
                    connector={HealthSoureSupportedConnectorTypes.APP_DYNAMICS}
                    value={formik.values.metricPacks}
                    onChange={async metricValue => {
                      await onValidate(formik?.values?.appdApplication, formik?.values?.appDTier, metricValue)
                    }}
                  />
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guidMap.get(formik?.values?.appDTier)}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.APP_DYNAMICS}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            <DrawerFooter isSubmit onPrevious={onPrevious} onNext={formik.submitForm} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

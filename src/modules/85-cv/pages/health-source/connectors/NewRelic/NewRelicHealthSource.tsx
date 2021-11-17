import React, { useEffect, useState, useMemo } from 'react'
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
  Utils,
  useToaster,
  Accordion
} from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetNewRelicApplications,
  AppdynamicsValidationResponse,
  MetricPackDTO,
  useGetLabelNames,
  useGetMetricPacks
} from 'services/cv'
import { Connectors } from '@connectors/constants'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'

import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import {
  initializeCreatedMetrics,
  initializePrometheusGroupNames,
  initializeSelectedMetricsMap,
  transformPrometheusHealthSourceToSetupSource,
  updateSelectedMetricsMap
} from '../PrometheusHealthSource/PrometheusHealthSource.utils'
import {
  CreatedMetricsWithSelectedIndex,
  MapPrometheusQueryToService,
  PrometheusMonitoringSourceFieldNames,
  SelectedAndMappedMetrics
} from '../PrometheusHealthSource/PrometheusHealthSource.constants'
import { validateNewRelic } from './NewRelicHealthSource.utils'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import MetricPack from '../MetrickPack'
import {
  getOptions,
  getInputGroupProps,
  validateMetrics,
  createMetricDataFormik
} from '../MonitoredServiceConnector.utils'
import { PrometheusGroupName } from '../PrometheusHealthSource/components/PrometheusGroupName/PrometheusGroupName'
import { PrometheusRiskProfile } from '../PrometheusHealthSource/components/PrometheusRiskProfile/PrometheusRiskProfile'
import { PrometheusQueryViewer } from '../PrometheusHealthSource/components/PrometheusQueryViewer/PrometheusQueryViewer'
import css from './NewrelicMonitoredSource.module.scss'

const guid = Utils.randomId()

export default function NewRelicHealthSource({
  data: newRelicData,
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
  const [labelNameTracingId] = useMemo(() => [Utils.randomId(), Utils.randomId()], [])
  const [newRelicValidation, setNewRelicValidation] = useState<{
    status: string
    result: AppdynamicsValidationResponse[] | []
  }>({
    status: '',
    result: []
  })
  const [rerenderKey, setRerenderKey] = useState('')

  console.log('WWWWWW', newRelicData)
  console.log('ddddd', rerenderKey)

  const transformedSourceData = useMemo(
    () => transformPrometheusHealthSourceToSetupSource(newRelicData),
    [newRelicData]
  )

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<SelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(
      getString('cv.monitoringSources.newRelic.newRelicMetric'),
      transformedSourceData.mappedServicesAndEnvs
    )
  )

  const [prometheusGroupNames, setPrometheusGroupName] = useState<SelectOption[]>(
    initializePrometheusGroupNames(mappedMetrics, getString)
  )

  const [{ createdMetrics }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(getString('cv.monitoringSources.newRelic.newRelicMetric'), selectedMetric, mappedMetrics)
  )

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = newRelicData?.connectorRef?.connector?.identifier || newRelicData?.connectorRef
  const labelNamesResponse = useGetLabelNames({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: labelNameTracingId }
  })
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'NEW_RELIC' }
  })

  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError
  } = useGetNewRelicApplications({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000,
      filter: '',
      tracingId: guid
    }
  })

  const onValidate = async (appName: string, appId: string, metricObject: { [key: string]: any }): Promise<void> => {
    setNewRelicValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks?.filter(item => metricObject[item.identifier as string])
    const { validationStatus, validationResult } = await validateMetrics(
      filteredMetricPack || [],
      {
        appId,
        appName,
        accountId,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      },
      HealthSoureSupportedConnectorTypes.NEW_RELIC
    )
    setNewRelicValidation({
      status: validationStatus as string,
      result: validationResult as AppdynamicsValidationResponse[]
    })
  }

  const applicationOptions: SelectOption[] = useMemo(
    () =>
      getOptions(applicationLoading, applicationsData?.data, HealthSoureSupportedConnectorTypes.NEW_RELIC, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  useEffect(() => {
    if (
      newRelicData.isEdit &&
      selectedMetricPacks.length &&
      newRelicValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(
        newRelicData?.applicationName,
        newRelicData?.applicationId,
        createMetricDataFormik(newRelicData?.metricPacks)
      )
    }
  }, [selectedMetricPacks, applicationLoading, newRelicData.isEdit])

  const initPayload = useMemo(() => {
    return {
      ...newRelicData,
      newRelicApplication: { label: newRelicData?.applicationName, value: newRelicData?.applicationId }
    }
  }, [newRelicData?.applicationName, newRelicData?.applicationId])

  if (applicationError) {
    clear()
    applicationError && showError(getErrorMessage(applicationError))
  }

  return (
    <Formik
      enableReinitialize
      formName={'newRelicHealthSourceform'}
      validate={values => validateNewRelic(values, getString)}
      validationSchema={Yup.object().shape({
        newRelicApplication: Yup.string().required(
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
                      formik.setFieldValue('newRelicApplication', item)
                      setNewRelicValidation({ status: '', result: [] })
                      onValidate(item?.label, item?.value.toString(), formik?.values?.metricData)
                    }}
                    value={
                      !formik?.values?.newRelicApplication
                        ? { label: '', value: '' }
                        : applicationOptions.find(
                            (item: SelectOption) => item.label === formik?.values?.newRelicApplication.label
                          )
                    }
                    name={'newRelicApplication'}
                    placeholder={
                      applicationLoading
                        ? getString('loading')
                        : getString('cv.healthSource.connectors.AppDynamics.applicationPlaceholder')
                    }
                    items={applicationOptions}
                    label={getString('cv.healthSource.connectors.NewRelic.applicationLabel')}
                    {...getInputGroupProps(() => formik.setFieldValue('newRelicApplication', ''))}
                  />
                </Container>
                <Container width={'300px'} color={Color.BLACK}>
                  {formik.values?.newRelicApplication.label && formik.values.newRelicApplication.value && (
                    <ValidationStatus
                      validationStatus={newRelicValidation?.status as StatusOfValidation}
                      onClick={
                        newRelicValidation.result?.length
                          ? () => setValidationResultData(newRelicValidation.result)
                          : undefined
                      }
                      onRetry={() =>
                        onValidate(formik.values.appdApplication, formik.values.appDTier, formik.values.metricData)
                      }
                    />
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
                    connector={HealthSoureSupportedConnectorTypes.NEW_RELIC}
                    value={formik.values.metricPacks}
                    onChange={async metricValue => {
                      await onValidate(
                        formik?.values?.newRelicApplication?.label,
                        formik?.values?.newRelicApplication?.value,
                        metricValue
                      )
                    }}
                  />
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guid}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.NEW_RELIC}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            <SetupSourceLayout
              leftPanelContent={
                <MultiItemsSideNav
                  defaultMetricName={getString('cv.monitoringSources.newRelic.newRelicMetric')}
                  tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                  addFieldLabel={getString('cv.monitoringSources.addMetric')}
                  createdMetrics={createdMetrics}
                  defaultSelectedMetric={selectedMetric}
                  renamedMetric={formik.values?.metricName}
                  isValidInput={formik.isValid}
                  onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) => {
                    setMappedMetrics(oldState => {
                      const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
                      const updatedMap = new Map(oldMappedMetric)

                      if (updatedMap.has(removedMetric)) {
                        updatedMap.delete(removedMetric)
                      } else {
                        // handle case where user updates the metric name for current selected metric
                        updatedMap.delete(oldMetric)
                      }

                      // update map with current values
                      if (formik.values?.metricName !== removedMetric) {
                        updatedMap.set(
                          updatedMetric,
                          { ...(formik.values as MapPrometheusQueryToService) } || { metricName: updatedMetric }
                        )
                      } else {
                        setRerenderKey(Utils.randomId())
                      }

                      setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                      return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
                    })
                  }}
                  onSelectMetric={(newMetric, updatedList, smIndex) => {
                    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                    setMappedMetrics(oldState => {
                      return updateSelectedMetricsMap({
                        updatedMetric: newMetric,
                        oldMetric: oldState.selectedMetric,
                        mappedMetrics: oldState.mappedMetrics,
                        formikProps: formik
                      })
                    })
                    setRerenderKey(Utils.randomId())
                  }}
                />
              }
              content={
                // add css
                <Container>
                  <SetupSourceCardHeader
                    mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
                    subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
                  />
                  <Layout.Horizontal spacing="xlarge">
                    <Accordion activeId="metricToService">
                      <Accordion.Panel
                        id="metricToService"
                        summary={getString('cv.monitoringSources.mapMetricsToServices')}
                        details={
                          <>
                            <FormInput.Text
                              label={getString('cv.monitoringSources.metricNameLabel')}
                              name={PrometheusMonitoringSourceFieldNames.METRIC_NAME}
                            />
                            <PrometheusGroupName
                              groupNames={prometheusGroupNames}
                              onChange={formik.setFieldValue}
                              item={formik.values?.groupName}
                              setPrometheusGroupNames={setPrometheusGroupName}
                            />
                          </>
                        }
                      />
                      <Accordion.Panel
                        id="riskProfile"
                        summary={getString('cv.monitoringSources.riskProfile')}
                        details={
                          <PrometheusRiskProfile
                            metricPackResponse={metricPackResponse}
                            labelNamesResponse={labelNamesResponse}
                          />
                        }
                      />
                    </Accordion>
                    <PrometheusQueryViewer
                      onChange={(fieldName, value) => {
                        if (
                          fieldName === PrometheusMonitoringSourceFieldNames.IS_MANUAL_QUERY &&
                          value === true &&
                          formik.values
                        ) {
                          formik.values.prometheusMetric = undefined
                          formik.values.serviceFilter = undefined
                          formik.values.envFilter = undefined
                          formik.values.additionalFilter = undefined
                          formik.values.prometheusMetric = undefined
                          formik.values.aggregator = undefined
                          formik.setValues({ ...formik.values, isManualQuery: true })
                        } else {
                          formik.setFieldValue(fieldName, value)
                        }
                      }}
                      values={formik.values}
                      connectorIdentifier={connectorIdentifier}
                    />
                  </Layout.Horizontal>
                </Container>
              }
            />
            <DrawerFooter isSubmit onPrevious={onPrevious} onNext={formik.submitForm} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

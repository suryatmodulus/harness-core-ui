import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  Color,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Link,
  SelectOption,
  Text,
  Icon
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { debounce, isNumber } from 'lodash-es'
import MonacoEditor from 'react-monaco-editor'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Drawer, IOptionProps } from '@blueprintjs/core'
import isEmpty from 'lodash-es/isEmpty'
import {
  ServiceSelectOrCreate,
  generateOptions as generateServiceOptions
} from '@cv/components/ServiceSelectOrCreate/ServiceSelectOrCreate'
import {
  EnvironmentSelect,
  generateOptions
} from '@cv/pages/monitoring-source/app-dynamics/SelectApplications/EnvironmentSelect'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetEnvironmentListForProject, useGetServiceListForProject } from 'services/cd-ng'
import { MetricPackDTO, TimeSeriesSampleDTO, useGetMetricPacks, useGetStackdriverSampleData } from 'services/cv'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import { useToaster } from '@common/exports'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { StringKeys } from 'framework/strings'
import { GCODashboardWidgetMetricNav } from './GCODashboardWidgetMetricNav/GCODashboardWidgetMetricNav'
import { chartsConfig } from './GCOWidgetChartConfig'
import { MANUAL_INPUT_QUERY } from '../ManualInputQueryModal/ManualInputQueryModal'
import {
  buildGCOMetricInfo,
  GCOMetricInfo,
  GCOMonitoringSourceInfo,
  getManuallyCreatedQueries,
  formatJSON
} from '../GoogleCloudOperationsMonitoringSourceUtils'
import css from './MapGCOMetricsToServices.module.scss'

interface MapGCOMetricsToServicesProps {
  data: GCOMonitoringSourceInfo
  onNext: (data: GCOMonitoringSourceInfo) => void
  onPrevious: () => void
}

interface MapMetricToServiceAndEnvironmentProps {
  metricName: string
}

interface ValidationChartProps {
  loading: boolean
  error?: string
  queryValue?: string
  onRetry: () => void
  sampleData?: Highcharts.Options
}

export const FieldNames = {
  METRIC_TAGS: 'metricTags',
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  SERVICE: 'service',
  ENVIRONMENT: 'environment',
  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation'
}

const OVERALL = 'overall'

const DrawerOptions = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true
}

function ensureFieldsAreFilled(values: GCOMetricInfo, getString: (key: StringKeys) => string): Record<string, any> {
  const ret: any = {}
  if (!values?.query?.length) {
    ret.query = getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
  }
  if (!values.riskCategory) {
    ret.riskCategory = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
  }
  if (!(values.higherBaselineDeviation || values.lowerBaselineDeviation)) {
    ret.higherBaselineDeviation = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  }
  if (!values?.environment) {
    ret.environment = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.env')
  }
  if (!values.service) {
    ret.service = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.service')
  }
  if (!values.metricName?.length) {
    ret.metricName = getString('cv.monitoringSources.gco.manualInputQueryModal.validation.metricName')
  }
  if (!values.metricTags) {
    ret.metricTags = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tags')
  }
  return ret
}

function validate(
  values: GCOMetricInfo,
  selectedMetrics: Map<string, GCOMetricInfo>,
  getString: (key: StringKeys) => string
): { [key: string]: string } | undefined {
  for (const entry of selectedMetrics) {
    const [, metricInfo] = entry
    if (isEmpty(ensureFieldsAreFilled(metricInfo, getString))) {
      return
    }
  }

  const errors = ensureFieldsAreFilled(values, getString)
  if (isEmpty(errors)) {
    return
  }

  return {
    [OVERALL]: getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.mainSetupValidation'),
    ...errors
  }
}

function initializeSelectedMetrics(
  selectedDashboards: GCOMonitoringSourceInfo['selectedDashboards'],
  selectedMetrics?: GCOMonitoringSourceInfo['selectedMetrics']
): GCOMonitoringSourceInfo['selectedMetrics'] {
  if (!selectedMetrics?.size) {
    return new Map()
  }

  const updatedMap = new Map(selectedMetrics)
  for (const entry of updatedMap) {
    const [metricName, metricInfo] = entry
    if (
      !selectedDashboards.find(dashboard => dashboard?.name === metricInfo?.dashboardName) &&
      !metricInfo.isManualQuery
    ) {
      updatedMap.delete(metricName)
    }
  }

  return updatedMap
}

function getRiskCategoryOptions(metricPacks?: MetricPackDTO[]): IOptionProps[] {
  if (!metricPacks?.length) {
    return []
  }

  const riskCategoryOptions: IOptionProps[] = []
  for (const metricPack of metricPacks) {
    if (metricPack?.identifier && metricPack.metrics?.length) {
      for (const metric of metricPack.metrics) {
        if (!metric?.name) {
          continue
        }

        riskCategoryOptions.push({
          label: metricPack.category !== metric.name ? `${metricPack.category}/${metric.name}` : metricPack.category,
          value: `${metricPack.category}/${metric.type}`
        })
      }
    }
  }

  return riskCategoryOptions
}

function transformSampleDataIntoHighchartOptions(sampleData?: TimeSeriesSampleDTO[]): Highcharts.Options {
  if (!sampleData?.length) {
    return {}
  }

  const seriesData = new Map<string, Highcharts.SeriesLineOptions>()
  for (const data of sampleData) {
    if (!data || !data.timestamp || !data.txnName || !isNumber(data.metricValue)) continue
    let highchartsOptions = seriesData.get(data.txnName)
    if (!highchartsOptions) {
      highchartsOptions = { name: data.txnName, data: [], type: 'line' }
      seriesData.set(data.txnName, highchartsOptions)
    }

    highchartsOptions.data?.push([data.timestamp, data.metricValue])
  }

  return chartsConfig(Array.from(seriesData.values()).slice(0, 5))
}

function ConfigureRiskProfile(): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { data } = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'STACKDRIVER' }
  })
  const [riskCategoryOptions, setRiskCategoryOptions] = useState<IOptionProps[]>([])

  useEffect(() => {
    setRiskCategoryOptions(getRiskCategoryOptions(data?.resource))
  }, [data])

  return (
    <Container className={css.configureRiskProfileContainer}>
      <Heading level={3} color={Color.BLACK} className={css.sectionHeading}>
        {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.configureRiskProfile')}
      </Heading>
      <FormInput.RadioGroup
        name={FieldNames.RISK_CATEGORY}
        items={riskCategoryOptions}
        className={css.inlineRadio}
        label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.riskCategoryLabel')}
      />
      <Container className={css.deviation}>
        <Text color={Color.BLACK} className={css.checkboxLabel}>
          {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.baselineDeviation')}
        </Text>
        <Container className={css.checkbox}>
          <FormInput.CheckBox
            name={FieldNames.HIGHER_BASELINE_DEVIATION}
            value="higher"
            label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.higherCounts')}
          />
          <FormInput.CheckBox
            name={FieldNames.LOWER_BASELINE_DEVIATION}
            value="lower"
            label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.lowerCounts')}
          />
        </Container>
      </Container>
    </Container>
  )
}

function MapMetricToServiceAndEnvironment(props: MapMetricToServiceAndEnvironmentProps): JSX.Element {
  const { metricName } = props
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const { data: environments, error: envError } = useGetEnvironmentListForProject({ queryParams })
  const { data: services, error: serviceError } = useGetServiceListForProject({ queryParams })
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([
    { value: '', label: getString('loading') }
  ])
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([{ value: '', label: getString('loading') }])

  useEffect(() => {
    if (envError?.message) {
      showError(envError.message, 5000)
    } else {
      setEnvironmentOptions(generateOptions(environments?.data?.content))
    }
  }, [environments, envError])

  useEffect(() => {
    if (serviceError?.message) {
      showError(serviceError.message, 5000)
    } else {
      setServiceOptions(generateServiceOptions(services?.data?.content))
    }
  }, [services, serviceError])

  return (
    <Container>
      <Heading level={3} color={Color.BLACK} className={css.sectionHeading}>
        {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.mapMetricToServiceAndEnvironment')}
      </Heading>
      <Container className={css.metricServiceEnvContainer}>
        <Container flex>
          <Icon name="service-stackdriver" className={css.logo} />
          <Text className={css.typedMetricName} width={200} lineClamp={1}>
            {metricName}
          </Text>
        </Container>
        <Text color={Color.BLACK}>{`${getString('cv.admin.mapsTo')} ${getString('service').toLocaleLowerCase()}`}</Text>
        <FormInput.CustomRender
          name={FieldNames.SERVICE}
          render={formikProps => {
            return (
              <ServiceSelectOrCreate
                className={css.envService}
                options={serviceOptions}
                key={`${formikProps.values[FieldNames.SERVICE]}-${serviceOptions.length}`}
                item={formikProps.values[FieldNames.SERVICE]}
                onNewCreated={newService => {
                  if (!newService || !newService.name || !newService.identifier) return
                  setServiceOptions([...serviceOptions, { value: newService.identifier, label: newService.name }])
                  formikProps.setFieldValue(FieldNames.SERVICE, {
                    value: newService.identifier,
                    label: newService.name
                  })
                }}
                onSelect={selectedOption => formikProps.setFieldValue(FieldNames.SERVICE, selectedOption)}
              />
            )
          }}
        />
        <Text color={Color.BLACK}>{`${getString('and').toLocaleLowerCase()} ${getString(
          'environment'
        ).toLocaleLowerCase()}`}</Text>
        <FormInput.CustomRender
          name={FieldNames.ENVIRONMENT}
          render={formikProps => {
            return (
              <EnvironmentSelect
                className={css.envService}
                options={environmentOptions}
                key={`${formikProps.values[FieldNames.ENVIRONMENT]}-${environmentOptions.length}`}
                item={formikProps.values[FieldNames.ENVIRONMENT]}
                onSelect={selectedOption => formikProps.setFieldValue(FieldNames.ENVIRONMENT, selectedOption)}
                onNewCreated={newEnvironment => {
                  if (!newEnvironment || !newEnvironment.name || !newEnvironment.identifier) return
                  setEnvironmentOptions([
                    ...environmentOptions,
                    { value: newEnvironment.identifier, label: newEnvironment.name }
                  ])
                  formikProps.setFieldValue(FieldNames.ENVIRONMENT, {
                    value: newEnvironment.identifier,
                    label: newEnvironment.name
                  })
                }}
              />
            )
          }}
        />
      </Container>
    </Container>
  )
}

function ValidationChart(props: ValidationChartProps): JSX.Element {
  const { loading, error, queryValue, onRetry, sampleData } = props
  const { getString } = useStrings()
  if (loading) {
    return <Icon name="steps-spinner" size={32} color={Color.GREY_600} className={css.sampleDataSpinner} />
  }
  if (error) {
    return (
      <Container className={css.chartContainer}>
        <PageError message={error} onClick={() => onRetry()} />
      </Container>
    )
  }

  if (!queryValue?.length) {
    return (
      <Container className={css.chartContainer}>
        <NoDataCard
          icon="main-notes"
          message={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.enterQueryForValidation')}
        />
      </Container>
    )
  }

  if (!sampleData?.series?.length) {
    return (
      <Container className={css.chartContainer}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.noDataForQuery')}
          buttonText={getString('retry')}
          onClick={() => onRetry()}
        />
      </Container>
    )
  }

  return (
    <Container className={css.chartContainer}>
      <HighchartsReact highcharts={Highcharts} options={sampleData} />
    </Container>
  )
}

function TextAreaLabel({ onExpandQuery }: { onExpandQuery: () => void }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container flex>
      <Text>{getString('cv.monitoringSources.gco.mapMetricsToServicesPage.operationsQueryLabel')}</Text>
      <Link withoutHref onClick={onExpandQuery}>
        {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.viewQuery')}
      </Link>
    </Container>
  )
}

export function MapGCOMetricsToServices(props: MapGCOMetricsToServicesProps): JSX.Element {
  const { data, onPrevious, onNext } = props
  const { getString } = useStrings()
  const [updatedData, setUpdatedData] = useState(
    initializeSelectedMetrics(data.selectedDashboards || [], data.selectedMetrics)
  )
  const [selectedMetric, setSelectedMetric] = useState<string>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const { mutate, cancel } = useGetStackdriverSampleData({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      connectorIdentifier: data.connectorRef?.value as string
    }
  })
  const [isQueryExpanded, setIsQueryExpanded] = useState(false)
  const [sampleData, setSampleData] = useState<Highcharts.Options | undefined>()
  const [, setDebouncedFunc] = useState<typeof debounce | undefined>()
  const onQueryChange = useCallback(
    async (updatedQueryValue: string | undefined, onError?: () => void) => {
      cancel()
      try {
        if (updatedQueryValue?.length) {
          setLoading(true)
          setError(undefined)
          const response = await mutate(JSON.parse(updatedQueryValue))
          if (response?.data) {
            setError(undefined)
            setSampleData(transformSampleDataIntoHighchartOptions(response?.data || []))
          }
          setLoading(false)
        } else {
          setError(undefined)
          setSampleData(transformSampleDataIntoHighchartOptions([]))
        }
      } catch (e) {
        if (e.message?.includes('The user aborted a request.')) {
          return
        }
        if (e.name === 'SyntaxError') {
          onError?.()
        } else if (e?.data) {
          setError(getErrorMessage(e))
          setSampleData(transformSampleDataIntoHighchartOptions([]))
        }
        setLoading(false)
      }
    },
    [mutate, cancel]
  )

  return (
    <Container className={css.main}>
      <Formik<GCOMetricInfo>
        enableReinitialize={true}
        initialValues={updatedData.get(selectedMetric || '') || {}}
        onSubmit={values => {
          if (selectedMetric) {
            updatedData.set(selectedMetric, { ...values })
          }
          const filteredData = new Map()
          for (const metric of updatedData) {
            const [metricName, metricInfo] = metric
            if (isEmpty(ensureFieldsAreFilled(metricInfo, getString))) {
              filteredData.set(metricName, metricInfo)
            }
          }
          onNext({ ...data, selectedMetrics: filteredData })
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validate={values => {
          const thing = validate(values, updatedData, getString)
          return thing
        }}
      >
        {formikProps => {
          return (
            <Container className={css.form}>
              <GCODashboardWidgetMetricNav
                className={css.leftNav}
                connectorIdentifier={data.connectorRef?.value as string}
                manuallyInputQueries={getManuallyCreatedQueries(updatedData)}
                gcoDashboards={data.selectedDashboards}
                showSpinnerOnLoad={!selectedMetric}
                onSelectMetric={(metricName, query, widget, dashboardName, dashboardPath) => {
                  let metricInfo = updatedData.get(metricName)
                  if (!metricInfo) {
                    metricInfo = buildGCOMetricInfo({
                      metricName,
                      query,
                      metricTags: { [widget]: '' },
                      isManualQuery: query === MANUAL_INPUT_QUERY,
                      dashboardName,
                      dashboardPath
                    })
                  }

                  metricInfo.query = formatJSON(metricInfo.query)
                  updatedData.set(metricName, metricInfo)
                  if (selectedMetric) {
                    updatedData.set(selectedMetric as string, { ...formikProps.values })
                  }

                  setUpdatedData(new Map(updatedData))
                  setSelectedMetric(metricName)
                  onQueryChange(metricInfo.query, () =>
                    formikProps.setFieldError(
                      FieldNames.QUERY,
                      getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.validJSON')
                    )
                  )
                }}
              />
              <FormikForm className={css.setupContainer}>
                <Heading level={3} color={Color.BLACK} className={css.sectionHeading}>
                  {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.querySpecifications')}
                </Heading>
                <Container className={css.nameAndMetricTagContainer}>
                  <FormInput.KVTagInput
                    label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.metricTagsLabel')}
                    name={FieldNames.METRIC_TAGS}
                    tagsProps={{
                      addOnBlur: true,
                      addOnPaste: true
                    }}
                  />
                  <FormInput.Text
                    label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.metricNameLabel')}
                    name={FieldNames.METRIC_NAME}
                    onChange={(newMetricName: FormEvent<HTMLInputElement>) => {
                      const currentSelectedInfo = updatedData.get(selectedMetric || '')
                      if (currentSelectedInfo?.isManualQuery && newMetricName.currentTarget.value) {
                        setSelectedMetric(newMetricName.currentTarget.value)
                        updatedData.delete(selectedMetric || '')
                        updatedData.set(newMetricName.currentTarget.value, { ...currentSelectedInfo })
                        setUpdatedData(new Map(updatedData))
                      }
                    }}
                  />
                </Container>
                <Container className={css.validationContainer}>
                  <FormInput.CustomRender
                    name={FieldNames.QUERY}
                    className={css.query}
                    label={<TextAreaLabel onExpandQuery={() => setIsQueryExpanded(true)} />}
                    render={() => (
                      <textarea
                        value={formikProps.values.query || ''}
                        name={FieldNames.QUERY}
                        onChange={event => {
                          event.persist()
                          formikProps.setFieldValue(FieldNames.QUERY, event.target?.value)
                          setDebouncedFunc((prevDebounce?: any) => {
                            prevDebounce?.cancel()
                            const debouncedFunc = debounce(onQueryChange, 750)
                            debouncedFunc(event.target.value, () =>
                              formikProps.setFieldError(
                                FieldNames.QUERY,
                                getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.validJSON')
                              )
                            )
                            return debouncedFunc as any
                          })
                        }}
                      />
                    )}
                  />
                  <ValidationChart
                    loading={loading}
                    error={error}
                    sampleData={sampleData}
                    queryValue={formikProps.values.query}
                    onRetry={async () => {
                      if (!formikProps.values.query?.length) return
                      onQueryChange(formikProps.values.query)
                    }}
                  />
                  {isQueryExpanded && (
                    <Drawer
                      {...DrawerOptions}
                      onClose={() => {
                        setIsQueryExpanded(false)
                        onQueryChange(formikProps.values.query, () =>
                          formikProps.setFieldError(
                            FieldNames.QUERY,
                            getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.validJSON')
                          )
                        )
                      }}
                    >
                      <MonacoEditor
                        language="javascript"
                        value={formatJSON(formikProps.values.query)}
                        onChange={val => formikProps.setFieldValue(FieldNames.QUERY, val)}
                        options={
                          {
                            readOnly: false,
                            wordBasedSuggestions: false,
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: 13
                          } as any
                        }
                      />
                    </Drawer>
                  )}
                </Container>
                <MapMetricToServiceAndEnvironment metricName={formikProps.values.metricName || ''} />
                <ConfigureRiskProfile />
                <FormInput.Text name={OVERALL} className={css.hiddenField} />
                <SubmitAndPreviousButtons onPreviousClick={onPrevious} />
              </FormikForm>
            </Container>
          )
        }}
      </Formik>
    </Container>
  )
}

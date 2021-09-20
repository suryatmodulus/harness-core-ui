import React, { FormEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  Color,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Text,
  Icon,
  Utils,
  FormError
} from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Drawer, IOptionProps } from '@blueprintjs/core'
import isEmpty from 'lodash-es/isEmpty'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMetricPacks, useGetStackdriverSampleData } from 'services/cv'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import { GCODashboardWidgetMetricNav } from './components/GCODashboardWidgetMetricNav/GCODashboardWidgetMetricNav'
import { MANUAL_INPUT_QUERY } from './components/ManualInputQueryModal/ManualInputQueryModal'
import {
  getManuallyCreatedQueries,
  formatJSON,
  getRiskCategoryOptions,
  initializeSelectedMetrics,
  transformSampleDataIntoHighchartOptions,
  validate,
  ensureFieldsAreFilled,
  transformGCOMetricSetupSourceToGCOHealthSource,
  transformGCOMetricHealthSourceToGCOMetricSetupSource
} from './GCOMetricsHealthSource.utils'
import DrawerFooter from '../../common/DrawerFooter/DrawerFooter'
import type { GCOMetricInfo, GCOMetricsHealthSourceProps, ValidationChartProps } from './GCOMetricsHealthSource.type'
import { OVERALL, FieldNames, DrawerOptions } from './GCOMetricsHealthSource.constants'
import css from './GCOMetricsHealthSource.module.scss'

const GroupByClause = 'groupByFields'

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
        label={getString('cv.monitoringSources.riskCategoryLabel')}
      />
      <Container className={css.deviation}>
        <Text color={Color.BLACK} className={css.checkboxLabel}>
          {getString('cv.monitoringSources.baselineDeviation')}
        </Text>
        <Container className={css.checkbox}>
          <FormInput.CheckBox
            name={FieldNames.HIGHER_BASELINE_DEVIATION}
            value="higher"
            label={getString('cv.monitoringSources.higherCounts')}
          />
          <FormInput.CheckBox
            name={FieldNames.LOWER_BASELINE_DEVIATION}
            value="lower"
            label={getString('cv.monitoringSources.lowerCounts')}
          />
        </Container>
      </Container>
    </Container>
  )
}

function ValidationChart(props: ValidationChartProps): JSX.Element {
  const { loading, error, queryValue, onRetry, sampleData, setAsTooManyMetrics, isQueryExecuted = false } = props
  const { getString } = useStrings()
  const isTooManyMetrics = Boolean(
    sampleData?.series?.length && sampleData.series.length > 1 && queryValue?.includes(GroupByClause)
  )

  useEffect(() => {
    setAsTooManyMetrics?.(isTooManyMetrics)
  }, [sampleData])

  if (!queryValue?.length) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
        <NoDataCard
          icon="main-notes"
          message={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.enterQueryForValidation')}
        />
      </Container>
    )
  }

  if (!isQueryExecuted) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
        <NoDataCard
          icon="timeline-line-chart"
          message={getString('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')}
        />
      </Container>
    )
  }

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

  if (!sampleData?.series?.length) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
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
      {isTooManyMetrics && (
        <Text
          intent="danger"
          font={{ size: 'small' }}
          className={css.tooManyRecords}
          icon="warning-sign"
          iconProps={{ intent: 'danger' }}
        >
          {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tooManyMetrics')}
        </Text>
      )}
    </Container>
  )
}

export function GCOMetricsHealthSource(props: GCOMetricsHealthSourceProps): JSX.Element {
  const { data, onSubmit } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const { getString } = useStrings()
  const transformedData = useMemo(() => transformGCOMetricHealthSourceToGCOMetricSetupSource(data), [data])
  const [updatedData, setUpdatedData] = useState(
    initializeSelectedMetrics(data.selectedDashboards || [], transformedData.metricDefinition)
  )
  const [shouldShowChart, setShouldShowChart] = useState<boolean>(false)
  const [selectedMetric, setSelectedMetric] = useState<string>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const queryParams = useMemo(
    () => ({
      orgIdentifier,
      projectIdentifier,
      accountId,
      tracingId: Utils.randomId(),
      connectorIdentifier: data.connectorRef as string
    }),
    [data?.connectorRef, projectIdentifier, orgIdentifier, accountId]
  )

  const { mutate, cancel } = useGetStackdriverSampleData({ queryParams })

  const [isQueryExpanded, setIsQueryExpanded] = useState(false)
  const [sampleData, setSampleData] = useState<Highcharts.Options | undefined>()

  const onQueryChange = useCallback(
    async (updatedQueryValue: string | undefined, onError?: () => void) => {
      cancel()
      try {
        if (updatedQueryValue?.length) {
          setLoading(true)
          setError(undefined)
          const response = await mutate(JSON.parse(updatedQueryValue), {
            queryParams: { ...queryParams, tracingId: Utils.randomId() }
          })
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
          setError(getErrorMessage(e))
          setSampleData(transformSampleDataIntoHighchartOptions([]))
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
  const onChangeMetric = (newMetricName: FormEvent<HTMLInputElement>) => {
    const currentSelectedInfo = updatedData.get(selectedMetric || '')
    if (currentSelectedInfo?.isManualQuery && newMetricName.currentTarget.value) {
      setSelectedMetric(newMetricName.currentTarget.value)
      updatedData.delete(selectedMetric || '')
      updatedData.set(newMetricName.currentTarget.value, { ...currentSelectedInfo })
      setUpdatedData(new Map(updatedData))
    }
  }
  return (
    <Formik<GCOMetricInfo>
      enableReinitialize={true}
      formName="mapGCOMetrics"
      initialValues={updatedData.get(selectedMetric || '') || {}}
      onSubmit={noop}
      validate={values => {
        const newMap = new Map(updatedData)
        if (selectedMetric) {
          newMap.set(selectedMetric, { ...values })
        }
        return validate(values, newMap, getString)
      }}
    >
      {formikProps => {
        return (
          <SetupSourceLayout
            content={
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
                      addOnPaste: true,
                      onChange: values => {
                        const newTagObj: { [key: string]: any } = {}
                        ;(values as string[])?.forEach(val => {
                          newTagObj[val as string] = ''
                        })
                        formikProps.setFieldValue(FieldNames.METRIC_TAGS, newTagObj)
                      }
                    }}
                  />
                  <FormError errorMessage={formikProps.errors['metricTags']} />
                  <FormInput.Text
                    label={getString('cv.monitoringSources.metricNameLabel')}
                    name={FieldNames.METRIC_NAME}
                    onChange={(newMetricName: FormEvent<HTMLInputElement>) => {
                      onChangeMetric(newMetricName)
                      formikProps.setFieldValue(FieldNames.METRIC_NAME, newMetricName.currentTarget?.value || '')
                    }}
                  />
                </Container>

                <Container className={css.validationContainer}>
                  <QueryContent
                    handleFetchRecords={async () => {
                      if (!shouldShowChart) {
                        setShouldShowChart(true)
                      }
                      onQueryChange(formikProps.values.query)
                    }}
                    onClickExpand={setIsQueryExpanded}
                    isDialogOpen={isQueryExpanded}
                    query={formikProps.values.query}
                    loading={loading}
                    textAreaName={FieldNames.QUERY}
                  />

                  <ValidationChart
                    loading={loading}
                    error={error}
                    sampleData={sampleData}
                    queryValue={formikProps.values.query}
                    setAsTooManyMetrics={isTooMany => {
                      if (isTooMany) {
                        formikProps.setFieldError('tooManyMetrics', 'invalid')
                      } else {
                        formikProps.setFieldError('tooManyMetrics', '')
                      }
                    }}
                    isQueryExecuted={shouldShowChart}
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

                <ConfigureRiskProfile />
                <FormInput.Text name={OVERALL} className={css.hiddenField} />
                <DrawerFooter
                  onPrevious={onPrevious}
                  isSubmit
                  onNext={async () => {
                    formikProps.setTouched({
                      ...formikProps.touched,
                      [OVERALL]: true,
                      [FieldNames.RISK_CATEGORY]: true,
                      [FieldNames.HIGHER_BASELINE_DEVIATION]: true,
                      [FieldNames.LOWER_BASELINE_DEVIATION]: true
                    } as any)

                    const errors = validate(formikProps.values, updatedData, getString)
                    if (!isEmpty(errors)) {
                      formikProps.setErrors({ ...errors })
                      return
                    }

                    if (selectedMetric) {
                      updatedData.set(selectedMetric, { ...formikProps.values })
                    }
                    const filteredData = new Map()
                    for (const metric of updatedData) {
                      const [metricName, metricInfo] = metric
                      if (isEmpty(ensureFieldsAreFilled(metricInfo, getString))) {
                        filteredData.set(metricName, metricInfo)
                      }
                    }

                    await onSubmit(
                      data,
                      transformGCOMetricSetupSourceToGCOHealthSource({
                        ...transformedData,
                        metricDefinition: filteredData
                      })
                    )
                  }}
                />
              </FormikForm>
            }
            leftPanelContent={
              <GCODashboardWidgetMetricNav
                connectorIdentifier={data.connectorRef as string}
                manuallyInputQueries={getManuallyCreatedQueries(updatedData)}
                gcoDashboards={data.selectedDashboards}
                showSpinnerOnLoad={!selectedMetric}
                onSelectMetric={(metricName, query, widget, dashboardName, dashboardPath) => {
                  let metricInfo: GCOMetricInfo | undefined = updatedData.get(metricName)
                  if (!metricInfo) {
                    metricInfo = {
                      metricName,
                      query,
                      metricTags: { [widget]: '' },
                      isManualQuery: query === MANUAL_INPUT_QUERY,
                      dashboardName,
                      dashboardPath
                    }
                  }

                  metricInfo.query = formatJSON(metricInfo.query) || ''
                  updatedData.set(metricName, metricInfo)
                  if (selectedMetric) {
                    updatedData.set(selectedMetric as string, { ...formikProps.values })
                  }

                  setUpdatedData(new Map(updatedData))
                  setSelectedMetric(metricName)
                  setShouldShowChart(false)
                  setError(undefined)
                  setSampleData(transformSampleDataIntoHighchartOptions([]))

                  formikProps.resetForm()
                }}
              />
            }
          />
        )
      }}
    </Formik>
  )
}

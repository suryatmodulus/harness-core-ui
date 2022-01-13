import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Color, Container, Heading, Utils } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { transformSampleDataIntoHighchartOptions } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.utils'

import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import { FieldNames } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.constants'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricsValidationChart from '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart'
import MetricDashboardWidgetNav from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav'
import type { CloudMetricsHealthSourceProps } from '@cv/components/CloudMetricsHealthSource/CloudMetricsHealthSource.type'
import SelectHealthSourceServices from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetLabelNames, useGetMetricPacks } from 'services/cv'
import css from '@cv/components/CloudMetricsHealthSource/CloudMetricHealthSource.module.scss'

export default function CloudMetricsHealthSource<T>(props: CloudMetricsHealthSourceProps<T>): JSX.Element {
  const {
    metricDetailsContent,
    selectedMetricInfo,
    onFetchTimeseriesData,
    timeseriesDataLoading,
    timeseriesDataError,
    dashboards,
    connectorRef,
    onWidgetMetricSelected,
    onNextClicked,
    manualQueries,
    addManualQueryTitle,
    dataSourceType,
    dashboardDetailRequest,
    dashboardDetailMapper,
    formikProps
  } = props
  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const [shouldShowChart, setShouldShowChart] = useState<boolean>(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const sampleData = useMemo(() => {
    return transformSampleDataIntoHighchartOptions(selectedMetricInfo?.timeseriesData || [])
  }, [selectedMetricInfo?.timeseriesData])

  useEffect(() => {
    if (!selectedMetricInfo?.timeseriesData) {
      setShouldShowChart(false)
    }
  }, [selectedMetricInfo?.timeseriesData])
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: dataSourceType }
  })
  const labelNameTracingId = useMemo(() => Utils.randomId(), [])
  const labelNamesResponse = useGetLabelNames({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountId,
      connectorIdentifier: connectorRef,
      tracingId: labelNameTracingId
    }
  })
  const { sli = false, healthScore = false, continuousVerification = false } = formikProps?.values
  return (
    <Container>
      <SetupSourceLayout
        leftPanelContent={
          <MetricDashboardWidgetNav<T>
            dashboardWidgetMapper={dashboardDetailMapper}
            dashboardDetailsRequest={dashboardDetailRequest}
            addManualQueryTitle={addManualQueryTitle}
            connectorIdentifier={connectorRef}
            manuallyInputQueries={manualQueries}
            dashboards={dashboards}
            showSpinnerOnLoad={!selectedMetricInfo}
            onSelectMetric={(id, metricName, query, widget, dashboardId, dashboardTitle) => {
              onWidgetMetricSelected({
                id,
                metricName,
                query,
                widgetName: widget,
                dashboardTitle,
                dashboardId
              })
            }}
          />
        }
        content={
          <Container className={css.setupContainer}>
            <Heading level={3} color={Color.BLACK} className={css.sectionHeading}>
              {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.querySpecifications')}
            </Heading>
            <Container className={css.metricsMappingContent}>
              <Container className={css.metricsQueryBuilderContainer}>
                {metricDetailsContent}
                <Container className={css.healthServicesContainer}>
                  <SelectHealthSourceServices
                    values={{
                      sli,
                      healthScore,
                      continuousVerification
                    }}
                    metricPackResponse={metricPackResponse}
                    labelNamesResponse={labelNamesResponse}
                    hideServiceIdentifier
                  />
                </Container>
              </Container>
              <Container className={css.validationContainer}>
                <QueryContent
                  textAreaProps={{ readOnly: !selectedMetricInfo?.queryEditable }}
                  handleFetchRecords={async () => {
                    if (!shouldShowChart) {
                      setShouldShowChart(true)
                    }
                    onFetchTimeseriesData()
                  }}
                  isDialogOpen={false}
                  query={selectedMetricInfo.query}
                  loading={!selectedMetricInfo}
                  textAreaName={FieldNames.QUERY}
                />
                <MetricsValidationChart
                  submitQueryText={'cv.monitoringSources.datadogLogs.submitQueryToSeeRecords'}
                  loading={timeseriesDataLoading}
                  error={timeseriesDataError}
                  sampleData={sampleData}
                  queryValue={selectedMetricInfo?.query}
                  isQueryExecuted={shouldShowChart}
                  onRetry={async () => {
                    if (!selectedMetricInfo?.query?.length) {
                      return
                    }
                    onFetchTimeseriesData()
                  }}
                />
              </Container>
            </Container>
            <DrawerFooter onPrevious={onPrevious} isSubmit onNext={onNextClicked} />
          </Container>
        }
      />
    </Container>
  )
}

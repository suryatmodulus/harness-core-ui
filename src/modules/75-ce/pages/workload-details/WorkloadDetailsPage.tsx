import React, { useMemo, useState } from 'react'
import { Container, Text, FlexExpander, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import cx from 'classnames'
import {
  useFetchWorkloadTimeSeriesQuery,
  useFetchWorkloadGridQuery,
  useFetchWorkloadSummaryQuery,
  QlceViewFilterOperator,
  ViewFieldIdentifier,
  QlceViewFilterWrapperInput,
  QlceViewTimeGroupType,
  ClusterData
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { getViewFilterForId, getTimeFilters, GROUP_BY_POD } from '@ce/utils/perspectiveUtils'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import { CCM_CHART_TYPES } from '@ce/constants'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import {
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  getGMTEndDateTime,
  getGMTStartDateTime
} from '@ce/utils/momentUtils'
import { CCM_PAGE_TYPE } from '@ce/types'
import PerspectiveGrid from '@ce/components/PerspectiveGrid/PerspectiveGrid'
import { Page } from '@common/exports'
import { TimeGranularityDropDown } from '@ce/components/PersepectiveExplorerFilters/PerspectiveExplorerFilters'
import WorkloadSummary from '@ce/components/WorkloadSummary/WorkloadSummary'
import { Aggregation, AggregationFunctionMapping } from './constants'
import css from './WorkloadDetailsPage.module.scss'

const WorkloadDetailsPage: () => JSX.Element = () => {
  const {
    clusterName,
    namespace,
    workloadName,
    perspectiveId,
    perspectiveName,
    recommendation,
    accountId,
    recommendationName
  } = useParams<{
    clusterName: string
    namespace: string
    workloadName: string
    perspectiveId: string
    perspectiveName: string
    recommendation: string
    accountId: string
    recommendationName: string
  }>()

  const { getString } = useStrings()

  const [chartDataAggregation, setChartDataAggregation] = useState<Aggregation>(Aggregation.TimeWeighted)

  const [aggregation, setAggregation] = useState<QlceViewTimeGroupType>(QlceViewTimeGroupType.Day)

  const [timeRange, setTimeRange] = useState<{ to: string; from: string }>({
    to: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  const filters = useMemo(() => {
    const commonFilters = [
      ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
      {
        idFilter: {
          values: [clusterName],
          operator: QlceViewFilterOperator.In,
          field: {
            fieldId: 'clusterName',
            fieldName: 'Cluster Name',
            identifierName: ViewFieldIdentifier.Cluster,
            identifier: ViewFieldIdentifier.Cluster
          }
        }
      },
      {
        idFilter: {
          values: [namespace],
          operator: QlceViewFilterOperator.In,
          field: {
            fieldId: 'namespace',
            fieldName: 'Namespace',
            identifierName: ViewFieldIdentifier.Cluster,
            identifier: ViewFieldIdentifier.Cluster
          }
        }
      },
      {
        idFilter: {
          values: [workloadName],
          operator: QlceViewFilterOperator.In,
          field: {
            fieldId: 'workloadName',
            fieldName: 'Workload Name',
            identifierName: ViewFieldIdentifier.Cluster,
            identifier: ViewFieldIdentifier.Cluster
          }
        }
      }
    ] as QlceViewFilterWrapperInput[]
    if (perspectiveId) {
      return [getViewFilterForId(perspectiveId), ...commonFilters]
    }
    return commonFilters
  }, [timeRange.to, timeRange.from, perspectiveId, workloadName, clusterName, namespace])

  const isClusterQuery = !perspectiveId

  const [gridResult] = useFetchWorkloadGridQuery({
    variables: {
      filters: filters,
      isClusterQuery
    }
  })

  const [chartResult] = useFetchWorkloadTimeSeriesQuery({
    variables: {
      filters: filters,
      isClusterQuery,
      aggregateFunction: AggregationFunctionMapping[chartDataAggregation]
    }
  })

  const [summaryResult] = useFetchWorkloadSummaryQuery({
    variables: {
      isClusterQuery,
      filters: filters
    }
  })

  const { data: gridData, fetching: gridFetching } = gridResult
  const { data: chartData, fetching: chartFetching } = chartResult
  const { data: summaryData, fetching: summaryFetching } = summaryResult

  const infoData = summaryData?.perspectiveGrid?.data?.length
    ? (summaryData.perspectiveGrid.data[0]?.clusterData as ClusterData)
    : ({} as ClusterData)

  return (
    <>
      <Page.Header
        title={workloadName}
        breadcrumbs={
          <Breadcrumbs
            links={
              recommendation
                ? [
                    {
                      url: routes.toCERecommendations({ accountId }),
                      label: getString('ce.recommendation.sideNavText')
                    },
                    {
                      url: routes.toCERecommendationDetails({ accountId, recommendation, recommendationName }),
                      label: workloadName
                    },
                    {
                      label: '',
                      url: '#'
                    }
                  ]
                : [
                    {
                      url: routes.toCEPerspectives({ accountId }),
                      label: getString('ce.perspectives.sideNavText')
                    },
                    {
                      url: routes.toPerspectiveDetails({ accountId, perspectiveId, perspectiveName }),
                      label: perspectiveName
                    },
                    {
                      label: '',
                      url: '#'
                    }
                  ]
            }
          />
        }
      />
      <Page.Body>
        <Container flex background="white" padding="small">
          <FlexExpander />
          <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
          <Text color="primary7">|</Text>
          <TimeGranularityDropDown aggregation={aggregation} setAggregation={setAggregation} />
        </Container>
        <Container padding="large">
          <WorkloadSummary
            pageType={CCM_PAGE_TYPE.Workload}
            summaryData={summaryData?.perspectiveTrendStats as any}
            fetching={summaryFetching}
            infoData={infoData}
          />
        </Container>
        <Container background="white">
          <Container padding="large">
            <Container
              margin={{
                bottom: 'medium'
              }}
            >
              <Layout.Horizontal spacing="small">
                <Text className={css.aggregationText} padding="xsmall" font="small">
                  {getString('ce.perspectives.workloadDetails.aggregation.text')}
                </Text>
                <div
                  className={cx(css.aggregationTags, {
                    [css.active]: chartDataAggregation === Aggregation.TimeWeighted
                  })}
                  onClick={() => {
                    setChartDataAggregation(Aggregation.TimeWeighted)
                  }}
                >
                  {getString('ce.perspectives.workloadDetails.aggregation.timeWeighted')}
                </div>
                <div
                  className={cx(css.aggregationTags, {
                    [css.active]: chartDataAggregation === Aggregation.Absolute
                  })}
                  onClick={() => {
                    setChartDataAggregation(Aggregation.Absolute)
                  }}
                >
                  {getString('ce.perspectives.workloadDetails.aggregation.absolute')}
                </div>
              </Layout.Horizontal>
            </Container>
            <CloudCostInsightChart
              showLegends={false}
              pageType={CCM_PAGE_TYPE.Workload}
              chartType={CCM_CHART_TYPES.LINE}
              columnSequence={[]}
              fetching={chartFetching}
              data={chartData?.perspectiveTimeSeriesStats as any}
              aggregation={aggregation}
              xAxisPointCount={DAYS_FOR_TICK_INTERVAL + 1}
            />
          </Container>
          <Container>
            <PerspectiveGrid
              isClusterOnly={true}
              gridData={gridData?.perspectiveGrid?.data as any}
              gridFetching={gridFetching}
              columnSequence={[]}
              setColumnSequence={noop}
              groupBy={GROUP_BY_POD}
            />
          </Container>
        </Container>
      </Page.Body>
    </>
  )
}

export default WorkloadDetailsPage

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Heading, Layout, Container, Icon } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'
import {
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchPerspectiveDetailsSummaryQuery,
  QlceViewFilterInput,
  QlceViewFilterOperator,
  QlceViewFieldInputInput
} from 'services/ce/services'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import PerspectiveExplorerGroupBy from '@ce/components/PerspectiveExplorerGroupBy/PerspectiveExplorerGroupBy'
import PersepectiveExplorerFilters from '@ce/components/PersepectiveExplorerFilters/PerspectiveExplorerFilters'
import PerspectiveSummary from '@ce/components/PerspectiveSummary/PerspectiveSummary'
import {
  getViewFilterForId,
  getTimeFilters,
  getGroupByFilter,
  getTimeRangeFilter,
  getFilters,
  DEFAULT_GROUP_BY
} from '@ce/utils/perspectiveUtils'
import { DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import css from './PerspectiveDetailsPage.module.scss'

interface PerspectiveParams {
  perspectiveId: string
  perspectiveName: string
}

const PerspectiveHeader: React.FC = () => {
  const { perspectiveName } = useParams<PerspectiveParams>()
  return (
    <Layout.Horizontal
      spacing="medium"
      width="100%"
      style={{
        alignItems: 'center'
      }}
      flex={true}
    >
      <Container
        style={{
          flexGrow: 1
        }}
      >
        <Heading color="grey800" level={2} style={{ flexGrow: 1 }}>
          {perspectiveName}
        </Heading>
      </Container>

      <Button text="Edit" icon="edit" intent="primary" />
      <Button text="Share" />
    </Layout.Horizontal>
  )
}

const PerspectiveDetailsPage: React.FC = () => {
  const { perspectiveId } = useParams<PerspectiveParams>()

  const [chartType, setChartType] = useState<CCM_CHART_TYPES>(CCM_CHART_TYPES.COLUMN)
  const [aggregation, setAggregation] = useState<QlceViewTimeGroupType>(QlceViewTimeGroupType.Day)

  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(DEFAULT_GROUP_BY)

  const [filters, setFilters] = useState<QlceViewFilterInput[]>([])

  const setFilterUsingChartClick: (value: string) => void = value => {
    setFilters([
      {
        field: { ...groupBy },
        operator: QlceViewFilterOperator.Equals,
        values: [value]
      }
    ])
  }

  const [timeRange, setTimeRange] = useState<{ to: number; from: number }>({
    to: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[1].valueOf(),
    from: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[0].valueOf()
  })

  const [chartResult] = useFetchPerspectiveTimeSeriesQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(timeRange.from, timeRange.to),
        ...getFilters(filters)
      ],
      limit: 12,
      groupBy: [getTimeRangeFilter(aggregation), getGroupByFilter(groupBy)]
    }
  })

  const { data: chartData, fetching: chartFetching } = chartResult

  const [summaryResult] = useFetchPerspectiveDetailsSummaryQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(timeRange.from, timeRange.to),
        ...getFilters(filters)
      ]
    }
  })

  const { data: summaryData, fetching: summaryFetching } = summaryResult

  return (
    <>
      <PageHeader title={<PerspectiveHeader />} />
      <PersepectiveExplorerFilters
        setAggregation={setAggregation}
        aggregation={aggregation}
        setTimeRange={setTimeRange}
      />
      <PerspectiveSummary data={summaryData?.perspectiveTrendStats} fetching={summaryFetching} />
      <Container margin="medium" background="white">
        <Container padding="small">
          <PerspectiveExplorerGroupBy
            chartType={chartType}
            setChartType={setChartType}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />
          {chartFetching ? (
            <Container className={css.chartLoadingContainer}>
              <Icon name="spinner" color="blue500" size={30} />
            </Container>
          ) : null}
          {!chartFetching && chartData?.perspectiveTimeSeriesStats && (
            <CloudCostInsightChart
              chartType={chartType}
              columnSequence={[]}
              setFilterUsingChartClick={setFilterUsingChartClick}
              fetching={chartFetching}
              data={chartData.perspectiveTimeSeriesStats}
              aggregation={aggregation}
              xAxisPointCount={chartData?.perspectiveTimeSeriesStats.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
            />
          )}
        </Container>
      </Container>
    </>
  )
}

export default PerspectiveDetailsPage

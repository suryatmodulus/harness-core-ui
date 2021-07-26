import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Button, Heading, Layout, Container, Icon } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { useGetPerspective } from 'services/ce/'
import {
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchPerspectiveDetailsSummaryQuery,
  QlceViewFilterInput,
  QlceViewFilterOperator,
  QlceViewFieldInputInput,
  useFetchperspectiveGridQuery,
  ViewChartType,
  ViewTimeRangeType,
  ViewType
} from 'services/ce/services'
import { PageBody } from '@common/components/Page/PageBody'
import { PageSpinner } from '@common/components'
import PerspectiveGrid from '@ce/components/PerspectiveGrid/PerspectiveGrid'
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
import { AGGREGATE_FUNCTION } from '@ce/components/PerspectiveGrid/Columns'
import { DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import css from './PerspectiveDetailsPage.module.scss'

interface PerspectiveParams {
  perspectiveId: string
  perspectiveName: string
  accountId: string
}

const PerspectiveHeader: React.FC<{ title: string; viewType: string }> = ({ title, viewType }) => {
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const history = useHistory()

  const isDefaultPerspective = viewType === ViewType.Default

  const goToEditPerspective: () => void = () => {
    history.push(
      routes.toCECreatePerspective({
        perspectiveId,
        accountId
      })
    )
  }

  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        alignItems: 'center'
      }}
      flex={true}
      className={css.perspectiveHeader}
    >
      <Container
        style={{
          flexGrow: 1
        }}
      >
        <Breadcrumbs
          links={[
            {
              url: routes.toCEPerspectives({ accountId }),
              label: 'Perspectives'
            },
            {
              label: '',
              url: '#'
            }
          ]}
        />
        <Heading color="grey800" level={2} style={{ flexGrow: 1 }}>
          {title}
        </Heading>
      </Container>

      <Button disabled={isDefaultPerspective} text="Edit" icon="edit" intent="primary" onClick={goToEditPerspective} />
      <Button text="Share" />
    </Layout.Horizontal>
  )
}

const PerspectiveDetailsPage: React.FC = () => {
  const { perspectiveId } = useParams<PerspectiveParams>() // TODO: accountId

  const { data: perspectiveRes, loading } = useGetPerspective({
    queryParams: {
      perspectiveId: perspectiveId
      // TODO: accountIdentifier: accountId
    }
  })

  const perspectiveData = perspectiveRes?.resource

  let isClusterOnly = false
  if (perspectiveData?.dataSources?.length === 1 && perspectiveData.dataSources[0] === 'CLUSTER') {
    isClusterOnly = true
  }

  const [chartType, setChartType] = useState<CCM_CHART_TYPES>(CCM_CHART_TYPES.COLUMN)
  const [aggregation, setAggregation] = useState<QlceViewTimeGroupType>(QlceViewTimeGroupType.Day)
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(DEFAULT_GROUP_BY)
  const [filters, setFilters] = useState<QlceViewFilterInput[]>([])
  const [columnSequence, setColumnSequence] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<{ to: number; from: number }>({
    to: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[1].valueOf(),
    from: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[0].valueOf()
  })

  const timeRangeMapper: Record<string, moment.Moment[]> = {
    [ViewTimeRangeType.Last_7]: DATE_RANGE_SHORTCUTS.LAST_7_DAYS,
    [ViewTimeRangeType.Last_30]: DATE_RANGE_SHORTCUTS.LAST_30_DAYS,
    [ViewTimeRangeType.LastMonth]: DATE_RANGE_SHORTCUTS.LAST_MONTH
  }

  useEffect(() => {
    if (perspectiveData) {
      const cType =
        perspectiveData.viewVisualization?.chartType === ViewChartType.StackedTimeSeries
          ? CCM_CHART_TYPES.COLUMN
          : CCM_CHART_TYPES.AREA
      setChartType(cType)
      perspectiveData.viewVisualization?.granularity &&
        setAggregation(perspectiveData.viewVisualization?.granularity as QlceViewTimeGroupType)
      perspectiveData.viewVisualization?.groupBy &&
        setGroupBy(perspectiveData.viewVisualization.groupBy as QlceViewFieldInputInput)

      const dateRange =
        (perspectiveData.viewTimeRange?.viewTimeRangeType &&
          timeRangeMapper[perspectiveData.viewTimeRange?.viewTimeRangeType]) ||
        DATE_RANGE_SHORTCUTS.LAST_7_DAYS

      setTimeRange({
        to: dateRange[1].valueOf(),
        from: dateRange[0].valueOf()
      })
    }
  }, [perspectiveData])

  const setFilterUsingChartClick: (value: string) => void = value => {
    setFilters(prevFilter => [
      ...prevFilter,
      {
        field: { ...groupBy },
        operator: QlceViewFilterOperator.In,
        values: [value]
      }
    ])
  }

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

  const [summaryResult] = useFetchPerspectiveDetailsSummaryQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(timeRange.from, timeRange.to),
        ...getFilters(filters)
      ]
    }
  })

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: isClusterOnly ? AGGREGATE_FUNCTION.CLUSTER : AGGREGATE_FUNCTION.DEFAULT,
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(timeRange.from, timeRange.to),
        ...getFilters(filters)
      ],
      isClusterOnly: isClusterOnly,
      limit: 100,
      offset: 0,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const { data: chartData, fetching: chartFetching } = chartResult
  const { data: gridData, fetching: gridFetching } = gridResults
  const { data: summaryData, fetching: summaryFetching } = summaryResult

  return (
    <>
      <PageHeader
        title={
          <PerspectiveHeader
            title={perspectiveData?.name || perspectiveId}
            viewType={perspectiveData?.viewType || ViewType.Default}
          />
        }
      />
      <PageBody>
        {loading && <PageSpinner />}
        <PersepectiveExplorerFilters
          setFilters={setFilters}
          filters={filters}
          setAggregation={setAggregation}
          aggregation={aggregation}
          setTimeRange={setTimeRange}
          timeRange={timeRange}
        />
        <PerspectiveSummary data={summaryData?.perspectiveTrendStats as any} fetching={summaryFetching} />
        <Container margin="xlarge" background="white" className={css.chartGridContainer}>
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
            {!chartFetching && chartData?.perspectiveTimeSeriesStats ? (
              <CloudCostInsightChart
                showLegends={true}
                chartType={chartType}
                columnSequence={columnSequence}
                setFilterUsingChartClick={setFilterUsingChartClick}
                fetching={chartFetching}
                data={chartData.perspectiveTimeSeriesStats as any}
                aggregation={aggregation}
                xAxisPointCount={chartData?.perspectiveTimeSeriesStats.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
              />
            ) : !chartFetching ? (
              <Container className={css.chartLoadingContainer}>
                <Icon name="deployment-failed-legacy" size={30} />
              </Container>
            ) : null}
          </Container>
          <PerspectiveGrid
            isClusterOnly={isClusterOnly}
            gridData={gridData?.perspectiveGrid?.data as any}
            gridFetching={gridFetching}
            columnSequence={columnSequence}
            setColumnSequence={colSeq => setColumnSequence(colSeq)}
            groupBy={groupBy}
          />
        </Container>
      </PageBody>
    </>
  )
}

export default PerspectiveDetailsPage

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text, Layout, FlexExpander, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import type moment from 'moment'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { CEView } from 'services/ce'
import {
  useFetchViewFieldsQuery,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFieldInputInput,
  ViewFieldIdentifier,
  ViewChartType,
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchperspectiveGridQuery,
  ViewTimeRangeType
} from 'services/ce/services'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import {
  normalizeViewRules,
  getRuleFilters,
  getGroupByFilter,
  getTimeRangeFilter,
  getTimeFilters,
  getViewFilterForId
} from '@ce/utils/perspectiveUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import { AGGREGATE_FUNCTION } from '../PerspectiveGrid/Columns'
import PerspectiveGrid from '../PerspectiveGrid/PerspectiveGrid'
import css from './PerspectiveBuilderPreview.module.scss'

interface GroupByViewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
}

const GroupByView: React.FC<GroupByViewProps> = ({ groupBy, setGroupBy, chartType, setChartType }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const { getString } = useStrings()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput]
    }
  })
  const { data, fetching } = result

  const [labelResult] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: 'LABEL'
            },
            operator: 'IN',
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 100
    }
  })

  const { data: labelResData } = labelResult

  const labelData = labelResData?.perspectiveFilters?.values

  const fieldIdentifierData = data?.perspectiveFields?.fieldIdentifierData

  const PopoverContent =
    fieldIdentifierData && fieldIdentifierData.length ? (
      <Menu>
        {fieldIdentifierData.map(field => {
          if (field) {
            return (
              <MenuItem className={css.menuItem} key={field.identifier} text={field.identifierName}>
                {field.values.length
                  ? field.values.map(value => {
                      if (value) {
                        if (value.fieldId === 'label' && labelData?.length) {
                          return (
                            <MenuItem className={css.menuItem} key={value.fieldId} text={value.fieldName}>
                              <div className={css.groupByLabel}>
                                {labelData.map(label => (
                                  <MenuItem
                                    className={css.menuItem}
                                    key={label}
                                    text={label}
                                    onClick={() =>
                                      setGroupBy({
                                        identifier: ViewFieldIdentifier.Label,
                                        fieldId: 'labels.value',
                                        fieldName: label || '',
                                        identifierName: 'Label'
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </MenuItem>
                          )
                        }
                        return (
                          <MenuItem
                            className={css.menuItem}
                            key={value.fieldId}
                            text={value.fieldName}
                            onClick={() =>
                              setGroupBy({
                                fieldId: value.fieldId,
                                fieldName: value.fieldName,
                                identifier: field.identifier,
                                identifierName: field.identifierName
                              })
                            }
                          />
                        )
                      }
                    })
                  : null}
              </MenuItem>
            )
          }
        })}
      </Menu>
    ) : undefined

  return (
    <Layout.Horizontal
      spacing="small"
      style={{
        alignItems: 'center'
      }}
    >
      <Text font="small" color="grey400">
        {getString('ce.perspectives.createPerspective.preview.groupBy')}
      </Text>
      <Popover
        disabled={fetching}
        position={Position.BOTTOM_LEFT}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={PopoverContent}
      >
        <Container background="grey100" className={cx(css.groupBySelect, { [css.groupBySelectLoading]: fetching })}>
          {fetching ? (
            <Icon name="spinner" />
          ) : (
            <Text font="small" background="grey100" rightIcon="chevron-down">
              {groupBy.fieldName}
            </Text>
          )}
        </Container>
      </Popover>
      <FlexExpander />
      <Container>{/* <Text font="small">Aggregation</Text> */}</Container>
      <Icon
        name="timeline-bar-chart"
        size={18}
        onClick={() => {
          setChartType(ViewChartType.StackedTimeSeries)
        }}
        color={chartType === ViewChartType.StackedTimeSeries ? 'primary6' : 'grey500'}
      />
      <Icon
        name="timeline-area-chart"
        size={20}
        onClick={() => {
          setChartType(ViewChartType.StackedLineChart)
        }}
        color={chartType === ViewChartType.StackedLineChart ? 'primary6' : 'grey500'}
      />
    </Layout.Horizontal>
  )
}

interface PerspectiveBuilderPreviewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
  formValues: CEView
}

const PerspectiveBuilderPreview: React.FC<PerspectiveBuilderPreviewProps> = ({
  groupBy,
  setGroupBy,
  chartType,
  setChartType,
  formValues
}) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const timeRangeMapper: Record<string, moment.Moment[]> = {
    [ViewTimeRangeType.Last_7]: DATE_RANGE_SHORTCUTS.LAST_7_DAYS,
    [ViewTimeRangeType.Last_30]: DATE_RANGE_SHORTCUTS.LAST_30_DAYS,
    [ViewTimeRangeType.LastMonth]: DATE_RANGE_SHORTCUTS.LAST_MONTH
  }

  const timeRange = formValues.viewTimeRange?.viewTimeRangeType || ViewTimeRangeType.Last_7

  const dateRange = timeRangeMapper[timeRange]
  const [chartResult] = useFetchPerspectiveTimeSeriesQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId, true),
        ...getTimeFilters(dateRange[0].valueOf(), dateRange[1].valueOf()),
        ...getRuleFilters(normalizeViewRules(formValues.viewRules))
      ],
      limit: 12,
      groupBy: [
        getTimeRangeFilter(
          (formValues.viewVisualization?.granularity as QlceViewTimeGroupType) || QlceViewTimeGroupType.Day
        ),
        getGroupByFilter(groupBy)
      ]
    }
  })

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: AGGREGATE_FUNCTION.DEFAULT,
      filters: [
        getViewFilterForId(perspectiveId, true),
        ...getTimeFilters(dateRange[0].valueOf(), dateRange[1].valueOf()),
        ...getRuleFilters(normalizeViewRules(formValues.viewRules))
      ],
      limit: 100,
      offset: 0,
      isClusterOnly: false,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const { data: gridData, fetching: gridFetching } = gridResults
  const { data: chartData, fetching } = chartResult

  const { getString } = useStrings()
  return (
    <Container padding="xxlarge" background="white" className={css.previewMainContainer}>
      <Layout.Vertical spacing="xlarge">
        <Container>
          <Text color="grey900">{getString('ce.perspectives.createPerspective.preview.title')}</Text>
          <GroupByView setGroupBy={setGroupBy} groupBy={groupBy} chartType={chartType} setChartType={setChartType} />
          {chartData?.perspectiveTimeSeriesStats ? (
            <CloudCostInsightChart
              chartType={chartType === ViewChartType.StackedLineChart ? CCM_CHART_TYPES.AREA : CCM_CHART_TYPES.COLUMN}
              columnSequence={[]}
              setFilterUsingChartClick={() => {
                noop
              }}
              fetching={fetching}
              showLegends={false}
              data={chartData.perspectiveTimeSeriesStats}
              aggregation={
                (formValues.viewVisualization?.granularity as QlceViewTimeGroupType) || QlceViewTimeGroupType.Day
              }
              xAxisPointCount={chartData?.perspectiveTimeSeriesStats.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
            />
          ) : null}
        </Container>
        <Container width={650}>
          <Text color="grey900">Cost Breakdown</Text>
          {gridData?.perspectiveGrid?.data && (
            <PerspectiveGrid
              gridFetching={gridFetching}
              gridData={gridData?.perspectiveGrid?.data as any}
              groupBy={groupBy}
              showColumnSelector={false}
              tempGridColumns={true}
              showPagination={false}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default PerspectiveBuilderPreview

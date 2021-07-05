import React, { useMemo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Container, Icon } from '@wings-software/uicore'
import type { Column } from 'react-table'
import { isEqual } from 'lodash-es'
import { todayInUTC } from '@ce/utils/momentUtils'
import {
  QlceViewFieldInputInput,
  QlceViewEntityStatsDataPoint,
  useFetchperspectiveGridQuery
} from 'services/ce/services'
import { getViewFilterForId, getTimeFilters, getGroupByFilter } from '@ce/utils/perspectiveUtils'
import ColumnSelector from './ColumnSelector'
import { AGGREGATE_FUNCTION, addLegendColorToRow, GridData, getGridColumnsByGroupBy } from './Columns'
import Grid from './Grid'
import css from './PerspectiveGrid.module.scss'

interface PerspectiveGridProps {
  columnSequence: string[]
  setColumnSequence?: (cols: string[]) => void
  groupBy: QlceViewFieldInputInput
}

interface PerspectiveParams {
  perspectiveId: string
  perspectiveName: string
}

const useFetchGridData = (groupBy: QlceViewFieldInputInput) => {
  const { perspectiveId } = useParams<PerspectiveParams>()
  const timeRange = {
    to: todayInUTC().startOf('day').valueOf(),
    from: todayInUTC().subtract(30, 'days').startOf('day').valueOf()
  }

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: AGGREGATE_FUNCTION.CLUSTER,
      filters: [getViewFilterForId(perspectiveId), ...getTimeFilters(timeRange.from, timeRange.to)],
      limit: 100,
      offset: 0,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const { data, fetching } = gridResults
  const gridData = useMemo(() => {
    if (!fetching && data?.perspectiveGrid?.data?.length) {
      return addLegendColorToRow(data.perspectiveGrid.data as QlceViewEntityStatsDataPoint[])
    }
  }, [data, fetching])

  return { gridData, fetching }
}

const PerspectiveGrid: React.FC<PerspectiveGridProps> = props => {
  const { columnSequence, setColumnSequence, groupBy } = props
  const gridColumns = getGridColumnsByGroupBy(groupBy)
  const [selectedColumns, setSelectedColumns] = useState(gridColumns)

  const { gridData = [], fetching } = useFetchGridData(groupBy)

  //TODO: fix the limit
  const newColumnSequence = gridData.slice(0, 12).map(row => row['id'])
  if (!isEqual(columnSequence, newColumnSequence) && setColumnSequence) {
    setColumnSequence(newColumnSequence as string[])
  }

  useEffect(() => {
    setSelectedColumns(getGridColumnsByGroupBy(groupBy))
  }, [groupBy])

  if (fetching) {
    return (
      <Container className={css.gridLoadingContainer}>
        <Icon name="spinner" color="blue500" size={30} />
      </Container>
    )
  }

  if (!gridData.length) {
    return (
      <Container className={css.gridLoadingContainer}>
        <Text>nothing to show</Text>
      </Container>
    )
  }

  return (
    <Container margin="medium" background="white">
      <ColumnSelector
        columns={gridColumns}
        selectedColumns={selectedColumns}
        onChange={columns => setSelectedColumns(columns)}
      />
      <Grid<GridData> data={gridData} columns={selectedColumns as Column<GridData>[]} />
    </Container>
  )
}

export default PerspectiveGrid

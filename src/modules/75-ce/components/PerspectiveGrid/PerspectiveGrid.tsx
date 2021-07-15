import React, { useMemo, useEffect, useState } from 'react'
import { Text, Container, Icon } from '@wings-software/uicore'
import type { Column } from 'react-table'
import { isEqual } from 'lodash-es'
import type { QlceViewFieldInputInput, QlceViewEntityStatsDataPoint, Maybe } from 'services/ce/services'
import ColumnSelector from './ColumnSelector'
import { addLegendColorToRow, GridData, getGridColumnsByGroupBy, PERSPECTIVE_PREVIEW_COLS } from './Columns'
import Grid from './Grid'
import './test.scss' // will find a alternative
import css from './PerspectiveGrid.module.scss'

interface PerspectiveGridProps {
  columnSequence?: string[]
  setColumnSequence?: (cols: string[]) => void
  groupBy: QlceViewFieldInputInput
  showColumnSelector?: boolean
  tempGridColumns?: boolean // TODO: remove after demo
  showPagination?: boolean
  gridData: Maybe<Maybe<QlceViewEntityStatsDataPoint>[]> | undefined
  gridFetching: boolean
}

const PerspectiveGrid: React.FC<PerspectiveGridProps> = props => {
  const {
    columnSequence,
    setColumnSequence,
    groupBy,
    showColumnSelector,
    gridData: response,
    gridFetching: fetching
  } = props

  const gridColumns = getGridColumnsByGroupBy(groupBy)
  const [selectedColumns, setSelectedColumns] = useState(gridColumns)

  const gridData = useMemo(() => {
    if (!fetching && response?.length) {
      return addLegendColorToRow(response as QlceViewEntityStatsDataPoint[])
    }
    return []
  }, [response, fetching])

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
        <Text>« no data »</Text>
      </Container>
    )
  }

  return (
    <Container background="white">
      {showColumnSelector && (
        <ColumnSelector
          columns={gridColumns}
          selectedColumns={selectedColumns}
          onChange={columns => setSelectedColumns(columns)}
        />
      )}
      <Grid<GridData>
        data={gridData}
        columns={
          props.tempGridColumns
            ? (PERSPECTIVE_PREVIEW_COLS as Column<GridData>[])
            : (selectedColumns as Column<GridData>[])
        }
        showPagination={props.showPagination}
      />
    </Container>
  )
}

PerspectiveGrid.defaultProps = {
  showColumnSelector: true
}

export default PerspectiveGrid

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Heading, Text } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Table } from '@common/components'
import type { TableProps } from '@common/components/Table/Table'
import { TableFilter, TableFilterProps } from '@cv/components/TableFilter/TableFilter'
import { NoDataCard, NoDataCardProps } from '@common/components/Page/NoDataCard'
import { PageError, PageErrorProps } from '@common/components/Page/PageError'
import { SetupSourceCardHeaderProps, SetupSourceEmptyCardHeader } from '../SetupSourceCardHeader/SetupSourceCardHeader'
import { StepLabel } from '../StepLabel/StepLabel'
import css from './SetupSourceMappingList.module.scss'

const FILTER_THRESHOLD = 100

interface TableFilterForSetupSourceMapping<T> extends Omit<TableFilterProps, 'onFilter' | 'className'> {
  isItemInFilter: (filterString: string, rowObject: T) => boolean
  totalItemsToRender?: number
  onFilterForMoreThan100Items?: (filterString: string) => void
}
export interface SetupSourceMappingListProps<T extends Record<string, unknown>> {
  tableProps: TableProps<T>
  mappingListHeaderProps: SetupSourceCardHeaderProps
  loading?: boolean
  error?: PageErrorProps
  noData?: Omit<NoDataCardProps, 'icon' | 'className'>
  tableFilterProps: TableFilterForSetupSourceMapping<T>
}

const LoadingData = [1, 2, 3, 4, 5, 6].map(() => ({} as any))

export function SetupSourceMappingList<T extends Record<string, unknown>>(
  props: SetupSourceMappingListProps<T>
): JSX.Element {
  const { tableProps, mappingListHeaderProps, loading, error, noData, tableFilterProps } = props
  const { getString } = useStrings()
  const [filterString, setFilterString] = useState<string | undefined>()
  const [isMoreThanFilterThreshold, setIsMoreThanFilterThreshold] = useState(tableProps.data.length >= FILTER_THRESHOLD)
  const filteredData = useMemo(() => {
    let resultData = tableProps.data
    if (filterString !== undefined && filterString !== null) {
      if ((isMoreThanFilterThreshold || !tableProps.data?.length) && tableFilterProps.onFilterForMoreThan100Items) {
        tableFilterProps.onFilterForMoreThan100Items(filterString)
      } else {
        resultData = tableProps.data.filter(data => tableFilterProps.isItemInFilter(filterString, data))
      }
    }

    return tableFilterProps.totalItemsToRender ? resultData.slice(0, tableFilterProps.totalItemsToRender) : resultData
  }, [filterString, tableProps.data, tableFilterProps.totalItemsToRender])

  useEffect(() => {
    if (tableProps.data?.length >= FILTER_THRESHOLD) {
      setIsMoreThanFilterThreshold(true)
    }
  }, [tableProps.data])

  const renderContent = () => {
    if (error?.message) {
      return <PageError {...error} className={css.error} />
    } else if (!loading && !tableProps?.data?.length && noData) {
      return <NoDataCard {...noData} className={css.noData} icon="warning-sign" />
    } else if (!loading && !filteredData?.length) {
      return <NoDataCard className={css.noData} icon="warning-sign" message={getString('filters.noDataFound')} />
    }
    return (
      <Table
        {...tableProps}
        columns={
          loading
            ? tableProps?.columns?.map(col => ({
                ...col,
                Cell: <Container width="95%" className={Classes.SKELETON} height={15} />
              }))
            : tableProps.columns
        }
        data={loading ? LoadingData : filteredData}
        className={css.mappingTable}
      />
    )
  }

  return (
    <Container className={css.main}>
      <SetupSourceEmptyCardHeader className={css.header}>
        <Container>
          {mappingListHeaderProps.stepLabelProps && <StepLabel {...mappingListHeaderProps.stepLabelProps} />}
          <Heading level={2} className={css.mainHeading}>
            {mappingListHeaderProps.mainHeading}
          </Heading>
          <Text className={css.subHeading}>{mappingListHeaderProps.subHeading}</Text>
        </Container>
        <TableFilter {...tableFilterProps} onFilter={setFilterString} className={css.search} />
      </SetupSourceEmptyCardHeader>
      {renderContent()}
    </Container>
  )
}

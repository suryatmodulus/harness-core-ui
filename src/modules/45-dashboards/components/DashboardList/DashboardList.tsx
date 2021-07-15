import React from 'react'
import { ExpandingSearchInput, Layout } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import Table from '@common/components/Table/Table'
import type { TableProps } from '@common/components/Table/Table'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import css from '@dashboards/components/DashboardList/DashboardList.module.scss'

export interface DashboardListProps<T extends Record<string, any>> {
  HeaderCustomPrimary?: () => React.ReactElement
  HeaderCustomSecondary?: () => React.ReactElement
  columns: TableProps<T>['columns']
  data: T[]
  totalItems?: number
  totalPages?: number
  onRowClick: (data: T) => void
}

const HeaderFilterComponent: React.FC<Record<string, any>> = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal margin={{ left: 'small' }}>
      <div className={css.expandSearch}>
        <ExpandingSearchInput
          placeholder={getString('search')}
          throttle={200}
          onChange={() => {
            /* handle input change logic */
          }}
        />
      </div>
      <FilterSelector<any>
        onFilterBtnClick={noop}
        onFilterSelect={noop}
        fieldToLabelMapping={new Map<string, string>()}
        filterWithValidFields={{}}
      />
    </Layout.Horizontal>
  )
}

export const DashboardList = <T extends Record<string, any>>(props: DashboardListProps<T>): React.ReactElement => {
  const {
    HeaderCustomPrimary = () => <></>,
    HeaderCustomSecondary = HeaderFilterComponent,
    columns,
    data,
    totalItems = 1,
    totalPages = -1,
    onRowClick
  } = props
  return (
    <Layout.Vertical>
      <Layout.Horizontal
        flex={{ distribution: 'space-between' }}
        padding={{ top: 'medium', bottom: 'medium' }}
        className={css.listHeader}
      >
        <HeaderCustomPrimary />
        <HeaderCustomSecondary />
      </Layout.Horizontal>
      <Table<T>
        columns={columns}
        data={data}
        pagination={{
          itemCount: totalItems,
          pageSize: 10,
          pageCount: totalPages,
          pageIndex: 0,
          gotoPage: () => {
            /**/
          }
        }}
        onRowClick={onRowClick}
      />
    </Layout.Vertical>
  )
}

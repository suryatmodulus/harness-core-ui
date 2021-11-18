import React, { FC } from 'react'
import { Layout, Color, DropDown, SelectOption } from '@wings-software/uicore'
import { Sort, SortFields } from '../../utils/Enums'
import css from './PolicySortDropDown.module.scss'

interface PolicySortDropDownProps {
  sortOptions: SelectOption[]
  selectedSort: SelectOption
  setSort: (value: [SortFields, Sort]) => void
  setSelectedSort: (item: SelectOption) => void
  setPageIndex: (text: number) => void
}

const PolicySortDropDown: FC<PolicySortDropDownProps> = ({
  sortOptions,
  selectedSort,
  setSort,
  setSelectedSort,
  setPageIndex
}) => {
  return (
    <Layout.Horizontal
      spacing="large"
      margin={{ left: 'large', top: 'large', bottom: 'large', right: 'large' }}
      className={css.topHeaderFields}
    >
      <DropDown
        items={sortOptions}
        value={selectedSort.value.toString()}
        filterable={false}
        width={180}
        icon={'main-sort'}
        iconProps={{ size: 16, color: Color.GREY_400 }}
        onChange={item => {
          if (item.value === SortFields.AZ09) {
            setSort([SortFields.Name, Sort.ASC])
          } else if (item.value === SortFields.ZA90) {
            setSort([SortFields.Name, Sort.DESC])
          } else if (item.value === SortFields.LastUpdatedAt) {
            setSort([SortFields.LastUpdatedAt, Sort.DESC])
          }
          setPageIndex(0)
          setSelectedSort(item)
        }}
      />
    </Layout.Horizontal>
  )
}

export default PolicySortDropDown

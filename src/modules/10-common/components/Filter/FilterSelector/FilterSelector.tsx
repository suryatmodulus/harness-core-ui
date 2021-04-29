import React from 'react'
import { MenuItem, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { truncate } from 'lodash-es'
import { Select, SelectOption, Layout, Popover, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getFilterSummary, MAX_FILTER_NAME_LENGTH, getFilterSize } from '@common/components/Filter/utils/FilterUtils'
import type { FilterInterface } from '../Constants'

import css from './FilterSelector.module.scss'

interface FilterSelectorProps<T> {
  appliedFilter?: T | null
  filters?: T[]
  onFilterBtnClick: () => void
  onFilterSelect: (option: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void
  fieldToLabelMapping: Map<string, string>
  filterWithValidFields: {
    [key: string]: string
  }
}

export default function FilterSelector<T extends FilterInterface>(props: FilterSelectorProps<T>): React.ReactElement {
  const { filters, onFilterBtnClick, onFilterSelect, appliedFilter, fieldToLabelMapping, filterWithValidFields } = props
  const { getString } = useStrings()

  const renderFilterBtn = React.useCallback(
    (): JSX.Element => (
      <Button
        id="ngfilterbtn"
        icon="ng-filter"
        onClick={onFilterBtnClick}
        className={css.ngFilter}
        intent="primary"
        minimal
        iconProps={{ size: 22 }}
        withoutBoxShadow
      />
    ),
    [onFilterBtnClick]
  )

  const fieldCountInAppliedFilter = getFilterSize(filterWithValidFields)

  return (
    <>
      <Select
        className={css.filterSelector}
        items={
          filters?.map((item: T) => {
            return {
              label: truncate(item?.name, { length: MAX_FILTER_NAME_LENGTH }),
              value: item?.identifier
            } as SelectOption
          }) || []
        }
        onChange={onFilterSelect}
        addClearBtn={true}
        value={{ label: appliedFilter?.name || '', value: appliedFilter?.identifier || '' }}
        inputProps={{
          placeholder: getString('filters.selectFilter')
        }}
        noResults={<MenuItem disabled={true} text={getString('filters.noFilterFound')} />}
      />
      <div>
        {fieldCountInAppliedFilter ? (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM}
            content={getFilterSummary(fieldToLabelMapping, filterWithValidFields)}
            popoverClassName={css.summaryPopover}
          >
            {renderFilterBtn()}
          </Popover>
        ) : (
          renderFilterBtn()
        )}
      </div>
      <Layout.Horizontal>
        {fieldCountInAppliedFilter > 0 ? <span className={css.fieldCount}>{fieldCountInAppliedFilter}</span> : null}
      </Layout.Horizontal>
    </>
  )
}

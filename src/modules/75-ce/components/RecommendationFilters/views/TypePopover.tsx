import React from 'react'
import { Container } from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import type { FilterStatsDto, Maybe } from 'services/ce/services'
import { useStrings } from 'framework/strings'

import MenuItemWithDivider from '@ce/common/MenuItemWithDivider/MenuItemWithDivider'
import { COST_FILTER_KEYS, getFiltersLabelName, getLabelMappingForFilters } from '../constants'

import css from '../RecommendationFilters.module.scss'

interface FilterTypePopoverProps {
  filterData: Maybe<FilterStatsDto>[]
  setSelectedType: React.Dispatch<React.SetStateAction<string | undefined>>
}

const FilterTypePopover: React.FC<FilterTypePopoverProps> = ({ filterData, setSelectedType }) => {
  const { getString } = useStrings()
  const keyToLabelMapping = getLabelMappingForFilters(getString)
  const costFiltersLabels = getFiltersLabelName(getString)
  return (
    <Container className={css.popoverContainer}>
      <Menu>
        <MenuItemWithDivider text={getString('ce.recommendation.listPage.filters.resourceType')} />
        {filterData.map(filter => {
          return filter?.key ? (
            <Menu.Item
              key={filter.key}
              className={css.menuItem}
              onClick={() => setSelectedType(`${filter.key}s`)}
              shouldDismissPopover={false}
              text={keyToLabelMapping[filter.key]}
            />
          ) : null
        })}
        <Menu.Divider />

        {COST_FILTER_KEYS.map(filter => {
          return (
            <Menu.Item
              key={filter}
              className={css.menuItem}
              onClick={() => setSelectedType(filter)}
              shouldDismissPopover={false}
              text={costFiltersLabels[filter]}
            />
          )
        })}
      </Menu>
    </Container>
  )
}

export default FilterTypePopover

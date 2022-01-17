/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Popover, Text, Layout, Icon } from '@wings-software/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useRecommendationFiltersQuery } from 'services/ce/services'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import formatCost from '@ce/utils/formatCost'
import ValuePopover from './views/ValuePopover'
import FilterTypePopover from './views/TypePopover'
import { COST_FILTER_KEYS, getLabelMappingForFilters, getFiltersLabelName } from './constants'
import css from './RecommendationFilters.module.scss'

// const CostInput = () => {
//   const [showInput, setShowInput] = useState(false)
//   return (
//     <Layout.Horizontal
//       style={{
//         alignItems: 'center'
//       }}
//       onClick={() => {
//         setShowInput(true)
//       }}
//       className={css.costInputContainer}
//     >
//       <Text className={css.costText}>Monthly Savings Greater than</Text>
//       <TextInput
//         onBlur={() => {
//           setShowInput(false)
//         }}
//         className={cx(css.costInput, { [css.visible]: showInput })}
//         placeholder="Enter Cost"
//       />
//     </Layout.Horizontal>
//   )
// }

interface FilterPillProps {
  keyName: string
  value: string
  onClear: () => void
  valueList?: string[]
}

const FilterPill: (props: FilterPillProps) => JSX.Element = ({ keyName, value, onClear, valueList }) => {
  return (
    <Layout.Horizontal
      key={keyName}
      background="blue100"
      border={{
        color: 'primary5'
      }}
      margin={{
        right: 'small'
      }}
      padding="xsmall"
      style={{
        alignItems: 'center'
      }}
      className={css.filterPillContainer}
    >
      <Text color="blue800" font="small">{`${keyName}: `}</Text>
      <Text
        className={css.filterValue}
        padding={{ left: 'xsmall' }}
        color="blue800"
        font="small"
        lineClamp={1}
        tooltip={
          valueList ? (
            <Container padding="small">
              <Text font={{ weight: 'semi-bold' }}>{keyName}</Text>
              {valueList.map(val => (
                <Text key={val}>{val}</Text>
              ))}
            </Container>
          ) : undefined
        }
      >
        {value}
      </Text>
      <Icon color="blue800" name="cross" size={12} onClick={onClear} />
    </Layout.Horizontal>
  )
}

interface RecommendationFiltersProps {
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  filters: Record<string, string[]>
  setCostFilters: React.Dispatch<React.SetStateAction<Record<string, number>>>
  costFilters: Record<string, number>
}

const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  setCostFilters,
  setFilters,
  filters,
  costFilters
}) => {
  const [selectedType, setSelectedType] = useState<string>()
  const [currentFilters, setCurrentFilters] = useState<Record<string, boolean>>({})
  const [currentCost, setCurrentCost] = useState<number>(0)

  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()

  const { perspectiveId, perspectiveName } = useQueryParams<{ perspectiveId: string; perspectiveName: string }>()

  const { getString } = useStrings()
  const keyToLabelMapping = getLabelMappingForFilters(getString)
  const costFiltersLabels = getFiltersLabelName(getString)

  const completeFilterSelection: () => void = () => {
    const getFilterArray = Object.keys(currentFilters).filter(val => currentFilters[val])

    if (selectedType && COST_FILTER_KEYS.includes(selectedType)) {
      setCostFilters(currentVal => ({
        ...currentVal,
        [selectedType]: currentCost
      }))
    } else {
      selectedType &&
        getFilterArray.length &&
        setFilters(currentVal => ({
          ...currentVal,
          [selectedType]: getFilterArray
        }))
    }
    setSelectedType(undefined)
    setCurrentFilters({})
  }

  const clearCurrentFilter: (type: string) => void = type => {
    setFilters(currenVal => {
      const newFilters = { ...currenVal }
      delete newFilters[type]
      return newFilters
    })
  }

  const clearCurrentCostFilter: (type: string) => void = type => {
    setCostFilters(currenVal => {
      const newFilters = { ...currenVal }
      delete newFilters[type]
      return newFilters
    })
  }

  const [result] = useRecommendationFiltersQuery({})

  const { data, fetching } = result

  const filterData = data?.recommendationFilterStatsV2 || []

  const valueMap: Record<string, string[]> = {}

  filterData.forEach(filter => {
    if (filter?.key && filter.values?.length) {
      valueMap[`${filter.key}s`] = filter.values as string[]
    }
  })

  const renderPerspectiveFilterPill = () => {
    if (!perspectiveId) {
      return null
    }

    const onClear: () => void = () => {
      history.replace(routes.toCERecommendations({ accountId }))
    }

    return <FilterPill keyName="Perspective" value={perspectiveName} onClear={onClear} />
  }

  return fetching ? (
    <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
  ) : (
    <>
      <Layout.Horizontal spacing="medium">
        {renderPerspectiveFilterPill()}
        {Object.keys(filters).map(filter => {
          return filters[filter] ? (
            <FilterPill
              key={filter}
              keyName={keyToLabelMapping[filter]}
              value={filters[filter].join(', ')}
              valueList={filters[filter]}
              onClear={() => {
                clearCurrentFilter(filter)
              }}
            />
          ) : null
        })}
        {Object.keys(costFilters).map(costFilter => {
          return costFilters[costFilter] ? (
            <FilterPill
              key={costFilter}
              keyName={costFiltersLabels[costFilter]}
              value={formatCost(costFilters[costFilter])}
              onClear={() => {
                clearCurrentCostFilter(costFilter)
              }}
            />
          ) : null
        })}
      </Layout.Horizontal>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.BOTTOM_LEFT}
        usePortal={false}
        onClosing={() => {
          completeFilterSelection()
        }}
        defaultIsOpen={selectedType ? true : false}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={
          selectedType ? (
            <ValuePopover
              setCurrentCost={setCurrentCost}
              valueMap={valueMap}
              selectedType={selectedType}
              setCurrentFilters={setCurrentFilters}
              currentFilters={currentFilters}
            />
          ) : (
            <FilterTypePopover filterData={filterData} setSelectedType={setSelectedType} />
          )
        }
      >
        <Container border padding="xsmall" width="220px">
          <Text icon="ng-filter">{getString('ce.recommendation.listPage.filterHereText')}</Text>
        </Container>
      </Popover>
    </>
  )
}

export default RecommendationFilters

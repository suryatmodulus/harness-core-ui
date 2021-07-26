import React, { useState } from 'react'
import { Container, Popover, Text, Layout, Icon } from '@wings-software/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useRecommendationFiltersQuery } from 'services/ce/services'
import formatCost from '@ce/utils/formatCost'
import ValuePopover from './views/ValuePopover'
import FilterTypePopover from './views/TypePopover'
import { COST_FILTER_KEYS, getLabelMappingForFilters, getFiltersLabelName } from './constants'

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

  const filterData = data?.recommendationFilterStats || []

  const valueMap: Record<string, string[]> = {}

  filterData.forEach(filter => {
    if (filter?.key && filter.values?.length) {
      valueMap[`${filter.key}s`] = filter.values as string[]
    }
  })

  return fetching ? (
    <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
  ) : (
    <>
      <Layout.Horizontal spacing="medium">
        {Object.keys(filters).map(filter => {
          return filters[filter] ? (
            <Layout.Horizontal
              key={filter}
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
            >
              <Text color="blue800" font="small">{`${keyToLabelMapping[filter]}: `}</Text>
              <Text
                padding={{ top: 'xsmall', left: 'xsmall' }}
                color="blue800"
                font="small"
                lineClamp={1}
                width={100}
                tooltip={
                  <Container padding="small">
                    <Text font={{ weight: 'semi-bold' }}>{keyToLabelMapping[filter]}</Text>
                    {filters[filter].map(val => (
                      <Text key={val}>{val}</Text>
                    ))}
                  </Container>
                }
              >
                {filters[filter].join(', ')}
              </Text>
              <Icon
                color="blue800"
                name="cross"
                size={12}
                onClick={() => {
                  clearCurrentFilter(filter)
                }}
              />
            </Layout.Horizontal>
          ) : null
        })}
        {Object.keys(costFilters).map(costFilter => {
          return costFilters[costFilter] ? (
            <Layout.Horizontal
              key={costFilter}
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
            >
              <Text color="blue800" font="small">{`${costFiltersLabels[costFilter]}: `}</Text>
              <Text padding={{ top: 'xsmall', left: 'xsmall' }} color="blue800" font="small">
                {formatCost(costFilters[costFilter])}
              </Text>
              <Icon
                color="blue800"
                name="cross"
                size={12}
                onClick={() => {
                  clearCurrentCostFilter(costFilter)
                }}
              />
            </Layout.Horizontal>
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

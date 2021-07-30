import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { QlceViewFilterOperator, Maybe } from 'services/ce/services'
import MultiValueSelectorComponent from '@ce/components/MultiValueSelectorComponent/MultiValueSelectorComponent'
import type { ProviderType } from '../PerspectiveBuilderFilter'

import css from '../PerspectiveBuilderFilter.module.scss'

interface ValuesSelectorProps {
  isDisabled: boolean
  provider: ProviderType | null | undefined
  service: ProviderType | null | undefined
  operator: QlceViewFilterOperator
  valueList: Maybe<string>[]
  fetching: boolean
  selectedVal: string[]
  onValueChange: (val: string[]) => void
  fetchMore?: (e: number) => void
  shouldFetchMore?: boolean
  onInputChange: (val: string) => void
  searchText: string
}

const ValuesSelector: React.FC<ValuesSelectorProps> = ({
  isDisabled,
  fetching,
  valueList,
  selectedVal,
  onValueChange,
  fetchMore,
  shouldFetchMore,
  onInputChange,
  searchText
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({})

  const { getString } = useStrings()

  useEffect(() => {
    const newSelectedVals: Record<string, boolean> = {}
    selectedVal?.forEach(val => {
      if (val) {
        newSelectedVals[val] = true
      }
    })
    setSelectedValues(newSelectedVals)
  }, [selectedVal])

  return (
    <Popover
      disabled={isDisabled}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      onClosing={() => {
        onValueChange(Object.keys(selectedValues).filter(val => selectedValues[val]))
      }}
      fill={true}
      usePortal={true}
      content={
        <MultiValueSelectorComponent
          fetching={fetching}
          valueList={valueList}
          shouldFetchMore={shouldFetchMore}
          setSelectedValues={setSelectedValues}
          selectedValues={selectedValues}
          fetchMore={fetchMore}
          onInputChange={onInputChange}
          searchText={searchText}
        />
      }
    >
      <div
        className={cx(
          css.operandSelectorContainer,
          { [css.disabledSelect]: isDisabled },
          { [css.reducedPadding]: selectedVal?.length }
        )}
      >
        {selectedVal?.length ? (
          <Layout.Horizontal spacing="xsmall">
            <Text className={css.selectedValues} width={90} lineClamp={1}>
              {selectedVal[0]}
            </Text>
            {selectedVal.length > 1 ? (
              <Text className={css.selectedValues} lineClamp={1}>{`+${selectedVal?.length - 1}`}</Text>
            ) : null}
          </Layout.Horizontal>
        ) : (
          getString('ce.perspectives.createPerspective.filters.selectValues')
        )}
        <Icon name="caret-down" />
      </div>
    </Popover>
  )
}

export default ValuesSelector

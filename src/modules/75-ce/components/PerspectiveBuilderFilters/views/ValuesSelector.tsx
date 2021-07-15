import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Virtuoso } from 'react-virtuoso'
import { Container, TextInput, Icon, Checkbox, Layout, Text } from '@wings-software/uicore'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { QlceViewFilterOperator, Maybe } from 'services/ce/services'
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
}

const ValuesSelector: React.FC<ValuesSelectorProps> = ({
  isDisabled,
  fetching,
  valueList,
  selectedVal,
  onValueChange
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({})
  const [searchText, setSearchText] = useState('')

  const { getString } = useStrings()

  useEffect(() => {
    const newSelectedVals: Record<string, boolean> = {}
    selectedVal.forEach(val => {
      if (val) {
        newSelectedVals[val] = true
      }
    })
    setSelectedValues(newSelectedVals)
  }, [selectedVal])

  const renderValues = () => {
    const filteredValues = valueList.filter(val => val && val.includes(searchText))
    return (
      <Container>
        <Virtuoso
          style={{ height: 350, paddingLeft: 10 }}
          data={filteredValues}
          overscan={{ main: 20, reverse: 20 }}
          itemContent={(_, value) => {
            if (!value) return null
            return (
              <Checkbox
                onClick={() => {
                  setSelectedValues(prevVal => ({
                    ...prevVal,
                    [value]: !prevVal[value]
                  }))
                }}
                checked={selectedValues[value]}
                className={css.checkbox}
                key={value}
                value={value}
                label={value}
              />
            )
          }}
        />
      </Container>
    )
  }

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
        <Container className={cx(css.valueContainer, { [css.valueFetching]: fetching })}>
          {fetching ? (
            <Icon name="spinner" size={28} color="blue500" />
          ) : (
            <>
              <TextInput
                onChange={e => {
                  const target = e.target as any
                  setSearchText(target.value)
                }}
                placeholder={getString('ce.perspectives.createPerspective.filters.searchText')}
              />
              {renderValues()}
            </>
          )}
        </Container>
      }
    >
      <div
        className={cx(
          css.operandSelectorContainer,
          { [css.disabledSelect]: isDisabled },
          { [css.reducedPadding]: selectedVal.length }
        )}
      >
        {selectedVal.length ? (
          <Layout.Horizontal spacing="xsmall">
            <Text className={css.selectedValues} width={90} lineClamp={1}>
              {selectedVal[0]}
            </Text>
            {selectedVal.length > 1 ? (
              <Text className={css.selectedValues} lineClamp={1}>{`+${selectedVal.length - 1}`}</Text>
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

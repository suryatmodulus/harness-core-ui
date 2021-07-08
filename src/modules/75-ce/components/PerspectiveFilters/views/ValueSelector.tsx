import React, { useState } from 'react'
import { Container, Layout, Text, TextInput, Checkbox } from '@wings-software/uicore'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { QlceViewFilterOperator } from 'services/ce/services'
import css from './views.module.scss'

const mockVal = [
  'filterVal1',
  'filterval2',
  'filterval3',
  'filterval4',
  'filterVal5',
  'filterval6',
  'filterval7',
  'filterval8'
]

interface OperatorSelectorProps {
  operator: QlceViewFilterOperator
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({ setOperator, operator }) => {
  const [selectedOperator, setSelectedOperator] = useState(operator)
  const { getString } = useStrings()

  const operators = [
    {
      value: QlceViewFilterOperator.In,
      label: getString('ce.perspectives.createPerspective.operatorLabels.in')
    },
    {
      value: QlceViewFilterOperator.NotIn,
      label: getString('ce.perspectives.createPerspective.operatorLabels.notIn')
    },
    {
      value: QlceViewFilterOperator.Null,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNull')
    },
    {
      value: QlceViewFilterOperator.NotNull,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNotNull')
    }
  ]

  return (
    <Container padding="medium">
      <Text>{getString('ce.perspectives.createPerspective.filters.selectOperator')}</Text>
      <Container
        margin={{
          top: 'small'
        }}
      >
        <RadioGroup
          onChange={e => {
            const target = e.target as any
            const value = target.value as QlceViewFilterOperator
            setSelectedOperator(value)
            setOperator(value)
          }}
          selectedValue={selectedOperator}
        >
          {operators.map(op => (
            <Radio className={css.radioValue} key={op.value} label={op.label} value={op.value} />
          ))}
        </RadioGroup>
      </Container>
    </Container>
  )
}

interface ValueSelectorProps {
  setValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
  operator: QlceViewFilterOperator
  values: Record<string, boolean>
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ setOperator, values, setValues, operator }) => {
  const { getString } = useStrings()

  return (
    <Container>
      <Layout.Horizontal spacing="small">
        <OperatorSelector setOperator={setOperator} operator={operator} />
        <Container padding="medium" background="blue50" className={css.valueSelectorContainer}>
          <Text>{getString('ce.perspectives.createPerspective.filters.selectValuesText')}</Text>
          <Layout.Horizontal
            margin={{
              left: 'xlarge'
            }}
            style={{
              alignItems: 'center'
            }}
          >
            <Checkbox />
            <TextInput className={css.searchInput} placeholder="Search Value" />
          </Layout.Horizontal>
          <Container
            margin={{
              left: 'xlarge'
            }}
          >
            {mockVal.map(val => {
              return (
                <Checkbox
                  key={val}
                  label={val}
                  checked={values[val]}
                  onChange={() => {
                    setValues(oldValue => ({ ...oldValue, [val]: !oldValue[val] }))
                  }}
                />
              )
            })}
          </Container>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default ValueSelector

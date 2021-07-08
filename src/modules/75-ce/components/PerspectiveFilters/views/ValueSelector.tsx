import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, TextInput, Checkbox, Icon } from '@wings-software/uicore'
import { RadioGroup, Radio } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import {
  QlceViewFilterOperator,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFilterWrapperInput
} from 'services/ce/services'
import type { ProviderType } from '../FilterPill'
import css from './views.module.scss'

interface OperatorSelectorProps {
  operator: QlceViewFilterOperator
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
  setValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({ setOperator, operator, setValues }) => {
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
            if (
              [QlceViewFilterOperator.NotNull, QlceViewFilterOperator.Null].includes(value) &&
              [QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn].includes(operator)
            ) {
              setValues({ ' ': true })
            }

            if (
              [QlceViewFilterOperator.NotNull, QlceViewFilterOperator.Null].includes(operator) &&
              [QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn].includes(value)
            ) {
              setValues({})
            }
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

interface NameSelectorProps {
  fetching: boolean
  nameList: string[]
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
}

const NameSelector: React.FC<NameSelectorProps> = ({ fetching, nameList, setService }) => {
  if (fetching) {
    return (
      <Container className={cx(css.namesContainer, css.spinner)}>
        <Icon name="spinner" color="blue500" />
      </Container>
    )
  }
  return (
    <Container className={css.namesContainer}>
      {nameList.map(name => (
        <Text
          className={css.labelNames}
          onClick={() => {
            setService({
              id: 'labels.value',
              name: name
            })
          }}
          padding="small"
          key={name}
        >
          {name}
        </Text>
      ))}
    </Container>
  )
}

interface ValueSelectorProps {
  setValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
  operator: QlceViewFilterOperator
  values: Record<string, boolean>
  service: ProviderType
  provider: ProviderType
  isLabelOrTag: boolean
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
}

const ValueSelector: React.FC<ValueSelectorProps> = ({
  setOperator,
  values,
  setValues,
  operator,
  provider,
  service,
  isLabelOrTag,
  setService
}) => {
  const { getString } = useStrings()

  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [result] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        { viewMetadataFilter: { viewId: perspectiveId, isPreview: false } } as QlceViewFilterWrapperInput,
        {
          idFilter: {
            field: {
              fieldId: service?.id,
              fieldName: service?.name,
              identifier: provider?.id,
              identifierName: provider?.name
            },
            operator: QlceViewFilterOperator.In,
            values: ['']
          }
        } as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 100
    }
  })

  const { data, fetching } = result

  const valuesList = (data?.perspectiveFilters?.values || []).filter(x => x) as string[]

  return (
    <Container>
      {isLabelOrTag ? (
        <Container>
          <NameSelector setService={setService} fetching={fetching} nameList={valuesList} />
        </Container>
      ) : (
        <Layout.Horizontal spacing="small">
          <OperatorSelector setOperator={setOperator} operator={operator} setValues={setValues} />
          {[QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn].includes(operator) && (
            <Container
              padding="medium"
              background="blue50"
              className={cx(css.valueSelectorContainer, { [css.loadingContainer]: fetching })}
            >
              {fetching ? (
                <Icon name="spinner" color="blue500" size={30} />
              ) : (
                <>
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
                  {
                    <Container
                      padding={{
                        left: 'xlarge'
                      }}
                      className={css.valueListContainer}
                    >
                      {valuesList.map(val => {
                        return (
                          <Checkbox
                            key={val}
                            label={val}
                            className={css.checkbox}
                            checked={values[val]}
                            onChange={() => {
                              setValues(oldValue => ({ ...oldValue, [val]: !oldValue[val] }))
                            }}
                          />
                        )
                      })}
                    </Container>
                  }
                </>
              )}
            </Container>
          )}
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default ValueSelector

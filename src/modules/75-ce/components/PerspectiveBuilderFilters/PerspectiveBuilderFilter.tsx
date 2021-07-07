import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon, Color, Container } from '@wings-software/uicore'
import {
  QlceViewFieldIdentifierData,
  QlceViewFilterOperator,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFilterWrapperInput
} from 'services/ce/services'
import OperatorSelector from './views/OperatorSelector'
import OperandSelector from './views/OperandSelector'
import ValuesSelector from './views/ValuesSelector'

import css from './PerspectiveBuilderFilter.module.scss'

export interface PillData {
  type: 'VIEW_ID_CONDITION'
  viewField: {
    fieldId: string
    fieldName: string
    identifier: string
    identifierName: string
  }
  viewOperator: QlceViewFilterOperator
  values: Array<string>
}

export type ProviderType = {
  id: string
  name: string
}

interface FilterPillProps {
  id: number
  removePill: () => void
  onChange: (id: number, data: Omit<PillData, 'type'>) => void
  pillData: PillData
  fieldValuesList: QlceViewFieldIdentifierData[]
  showAddButton: boolean
  onButtonClick: () => void
}

const PerspectiveBuilderFilter: React.FC<FilterPillProps> = ({
  fieldValuesList,
  removePill,
  showAddButton,
  onButtonClick,
  onChange,
  pillData,
  id
}) => {
  const provider: ProviderType = {
    id: pillData.viewField.identifier,
    name: pillData.viewField.identifierName
  }

  const service: ProviderType = {
    id: pillData.viewField.fieldId,
    name: pillData.viewField.fieldName
  }

  const operator: QlceViewFilterOperator = pillData.viewOperator
  const selectedVal: string[] = pillData.values

  const setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void = (
    providerData,
    serviceData
  ) => {
    const changedData = {
      ...pillData,
      viewField: {
        fieldId: serviceData.id,
        fieldName: serviceData.name,
        identifierName: providerData.name,
        identifier: providerData.id
      }
    }
    onChange(id, changedData)
  }

  const onOperatorChange: (op: QlceViewFilterOperator) => void = op => {
    const changedData = {
      ...pillData,
      viewOperator: op
    }
    if (op === QlceViewFilterOperator.Null || op === QlceViewFilterOperator.NotNull) {
      onChange(id, { ...changedData, values: [''] })
    } else {
      onChange(id, changedData)
    }
  }

  const onValueChange: (val: string[]) => void = val => {
    const changedData = {
      ...pillData,
      values: val
    }
    onChange(id, changedData)
  }

  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [result] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        { viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput,
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
    },
    pause: !service
  })

  const { data, fetching } = result

  return (
    <Container className={css.mainContainer}>
      <OperandSelector
        provider={provider}
        service={service}
        fieldValuesList={fieldValuesList}
        setProviderAndIdentifier={setProviderAndIdentifier}
      />
      <OperatorSelector isDisabled={!provider} operator={operator} onOperatorChange={onOperatorChange} />
      <ValuesSelector
        provider={provider}
        service={service}
        isDisabled={
          !provider || operator === QlceViewFilterOperator.NotNull || operator === QlceViewFilterOperator.Null
        }
        operator={operator}
        valueList={data?.perspectiveFilters?.values || ([] as string[])}
        fetching={fetching}
        selectedVal={selectedVal}
        onValueChange={onValueChange}
      />

      <Icon key="delete" name="delete" size={18} color={Color.ORANGE_500} onClick={removePill} />
      {showAddButton ? <Icon key="add" name="add" size={18} color={Color.BLUE_500} onClick={onButtonClick} /> : null}
    </Container>
  )
}

export default PerspectiveBuilderFilter

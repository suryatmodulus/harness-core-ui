/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Icon, Color, Container } from '@wings-software/uicore'
import {
  QlceViewFieldIdentifierData,
  QlceViewFilterOperator,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFilterWrapperInput
} from 'services/ce/services'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import { getGMTEndDateTime, getGMTStartDateTime } from '@ce/utils/momentUtils'
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
  timeRange: {
    to: string
    from: string
  }
}

const LIMIT = 100

const PerspectiveBuilderFilter: React.FC<FilterPillProps> = ({
  fieldValuesList,
  removePill,
  showAddButton,
  onButtonClick,
  onChange,
  pillData,
  id,
  timeRange
}) => {
  const provider: ProviderType = {
    id: pillData.viewField.identifier,
    name: pillData.viewField.identifierName
  }

  const service: ProviderType = {
    id: pillData.viewField.fieldId,
    name: pillData.viewField.fieldName
  }

  const [pageInfo, setPageInfo] = useState<{
    filtersValuesData: string[]
    loadMore: boolean
    page: number
    searchValue: string
  }>({
    filtersValuesData: [],
    loadMore: true,
    page: 1,
    searchValue: ''
  })

  const operator: QlceViewFilterOperator = pillData.viewOperator
  const selectedVal: string[] = pillData.values

  const setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void = (
    providerData,
    serviceData
  ) => {
    onInputChange('')
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
    onInputChange('')
    const changedData = {
      ...pillData,
      viewOperator: op
    }
    if (op === QlceViewFilterOperator.Null || op === QlceViewFilterOperator.NotNull) {
      onChange(id, { ...changedData, values: [''] })
    } else if ([QlceViewFilterOperator.Null, QlceViewFilterOperator.NotNull].includes(operator)) {
      onChange(id, { ...changedData, values: [] })
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
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        {
          idFilter: {
            field: {
              fieldId: service?.id,
              fieldName: service?.name,
              identifier: provider?.id,
              identifierName: provider?.name
            },
            operator: QlceViewFilterOperator.In,
            values: [pageInfo.searchValue]
          }
        } as QlceViewFilterWrapperInput
      ],
      offset: (pageInfo.page - 1) * LIMIT,
      limit: LIMIT
    },
    pause: !provider.id || [QlceViewFilterOperator.NotNull, QlceViewFilterOperator.Null].includes(operator)
  })

  const { data, fetching } = result

  useEffect(() => {
    if (data?.perspectiveFilters?.values) {
      const moreItemsPresent = data.perspectiveFilters.values.length === LIMIT
      const filteredVal = data.perspectiveFilters.values.filter(e => e) as string[]
      setPageInfo(prevInfo => ({
        ...prevInfo,
        loadMore: moreItemsPresent,
        filtersValuesData: [...prevInfo.filtersValuesData, ...filteredVal]
      }))
    }
  }, [data?.perspectiveFilters?.values])

  const onInputChange: (val: string) => void = val => {
    setPageInfo({
      filtersValuesData: [],
      loadMore: true,
      page: 1,
      searchValue: val
    })
  }

  return (
    <Container className={css.mainContainer}>
      <OperandSelector
        provider={provider}
        service={service}
        fieldValuesList={fieldValuesList}
        setProviderAndIdentifier={setProviderAndIdentifier}
      />
      <OperatorSelector isDisabled={!provider.id} operator={operator} onOperatorChange={onOperatorChange} />
      <ValuesSelector
        provider={provider}
        service={service}
        isDisabled={
          !provider.id || operator === QlceViewFilterOperator.NotNull || operator === QlceViewFilterOperator.Null
        }
        operator={operator}
        valueList={pageInfo.filtersValuesData}
        fetchMore={e => {
          if (e === pageInfo.page * LIMIT - 1) {
            setPageInfo(prevInfo => ({ ...prevInfo, page: prevInfo.page + 1 }))
          }
        }}
        onInputChange={onInputChange}
        shouldFetchMore={pageInfo.loadMore}
        fetching={!pageInfo.filtersValuesData.length && fetching}
        selectedVal={selectedVal}
        onValueChange={onValueChange}
        searchText={pageInfo.searchValue}
      />

      <Icon key="delete" name="delete" size={18} color={Color.ORANGE_500} onClick={removePill} />
      {showAddButton ? <Icon key="add" name="add" size={18} color={Color.BLUE_500} onClick={onButtonClick} /> : null}
    </Container>
  )
}

export default PerspectiveBuilderFilter

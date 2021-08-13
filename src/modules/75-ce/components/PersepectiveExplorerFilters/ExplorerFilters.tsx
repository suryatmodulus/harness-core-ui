import React from 'react'
import { Container, Button, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
// import cx from 'classnames'
import { useFetchViewFieldsQuery, QlceViewFilterWrapperInput, QlceViewFilterInput } from 'services/ce/services'
import FilterPill from '../PerspectiveFilters/FilterPill'
import css from './ExplorerFilters.module.scss'

interface ExplorerFiltersProps {
  setFilters: React.Dispatch<React.SetStateAction<QlceViewFilterInput[]>>
  filters: QlceViewFilterInput[]
  timeRange: {
    to: string
    from: string
  }
}

const ExplorerFilters: React.FC<ExplorerFiltersProps> = ({ setFilters, filters, timeRange }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: false } } as QlceViewFilterWrapperInput]
    }
  })
  const { data: fieldResData, fetching } = result

  const fieldIdentifierData = fieldResData?.perspectiveFields?.fieldIdentifierData

  const onPillDataChange: (id: number, data: QlceViewFilterInput) => void = (id, data) => {
    if (data.field.identifier === 'CUSTOM') {
      data.values = []
    }
    const newFilters = filters.map((filter, idx) => {
      if (idx === id) {
        return {
          type: 'VIEW_ID_CONDITION',
          ...data
        }
      }
      return filter
    }) as QlceViewFilterInput[]
    setFilters(newFilters)
  }

  if (fetching) {
    return (
      <Container>
        <Icon name="spinner" />
      </Container>
    )
  }

  if (!fieldIdentifierData) {
    return (
      <Container>
        <Icon name="deployment-incomplete-legacy" />
      </Container>
    )
  }

  return (
    <Container>
      <section className={css.filtersContainer}>
        {filters.map((filterData, index) => {
          return (
            <>
              <FilterPill
                key={`${filterData.field.fieldName}-${filterData.field.identifier}-${index}`}
                id={index}
                timeRange={timeRange}
                removePill={() => {
                  // arrayHelpers.remove(index)
                  // removePill && removePill(innerIndex)
                  const updatedFilters = filters.filter((_, idx) => (idx == index ? false : true))
                  setFilters(updatedFilters)
                }}
                fieldValuesList={fieldIdentifierData}
                onChange={onPillDataChange}
                pillData={filterData}
              />
              {/* {showAndOperator ? <Text className={css.andOperator}>AND</Text> : ''} */}
            </>
          )
        })}

        <Button
          intent="primary"
          minimal
          text="+ add filter"
          onClick={() => {
            const addedFilter = [
              ...filters,
              {
                field: {
                  fieldId: '',
                  fieldName: '',
                  identifier: '',
                  identifierName: ''
                },
                operator: 'IN',
                values: []
              }
            ] as QlceViewFilterInput[]

            setFilters(addedFilter)
          }}
        />
      </section>
    </Container>
  )
}

export default ExplorerFilters

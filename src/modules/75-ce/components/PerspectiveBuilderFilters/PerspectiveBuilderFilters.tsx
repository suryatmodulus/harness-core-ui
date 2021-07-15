import React from 'react'
import { FieldArray } from 'formik'
import cx from 'classnames'
import type { FormikExtended } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import type { CEView } from 'services/ce/'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'

import PerspectiveBuilderFilter, { PillData } from './PerspectiveBuilderFilter'

import css from './PerspectiveBuilderFilters.module.scss'

interface FiltersProps {
  index: number
  formikProps: FormikExtended<CEView>
  removePill?: (id: number) => void
  showAndOperator?: boolean
  fieldValuesList: QlceViewFieldIdentifierData[]
  removeEntireRow: () => void
}

const Filters: React.FC<FiltersProps> = ({ index, formikProps, removePill, fieldValuesList, removeEntireRow }) => {
  const onPillDataChange: (id: number, data: Omit<PillData, 'type'>) => void = (id, data) => {
    const setFieldValue = formikProps.setFieldValue
    if (data.viewField.identifier === 'CUSTOM') {
      data.values = []
    }
    setFieldValue(`viewRules[${index}].viewConditions[${id}]`, data)
  }

  return (
    <FieldArray
      name={`viewRules[${index}].viewConditions`}
      render={arrayHelpers => {
        const viewRules = formikProps?.values?.viewRules
        const filters = ((viewRules && viewRules[index].viewConditions) || []) as unknown as PillData[]
        return (
          <section className={cx(css.filterContainer)}>
            {filters.map((data, innerIndex) => {
              return (
                <>
                  <PerspectiveBuilderFilter
                    showAddButton={innerIndex === filters.length - 1}
                    onButtonClick={() => {
                      arrayHelpers.push({
                        type: 'VIEW_ID_CONDITION',
                        viewField: {
                          fieldId: '',
                          fieldName: '',
                          identifier: '',
                          identifierName: ''
                        },
                        viewOperator: 'IN',
                        values: []
                      })
                    }}
                    key={`filter-pill-${innerIndex}`}
                    id={innerIndex}
                    removePill={() => {
                      if (filters.length === 1) {
                        removeEntireRow()
                        return
                      }
                      arrayHelpers.remove(innerIndex)
                      removePill && removePill(innerIndex)
                    }}
                    fieldValuesList={fieldValuesList}
                    onChange={onPillDataChange}
                    pillData={data}
                  />
                  {/* {showAndOperator ? <Text className={css.andOperator}>AND</Text> : ''} */}
                </>
              )
            })}
          </section>
        )
      }}
    />
  )
}

export default Filters

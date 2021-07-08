import React from 'react'
import { useParams } from 'react-router-dom'
import { FieldArray } from 'formik'
import { Icon, Text, Button, Color } from '@wings-software/uicore'
import cx from 'classnames'
import type { FormikExtended } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import { useStrings } from 'framework/strings'
import { QlceViewFieldIdentifierData, useFetchViewFieldsQuery, QlceViewFilterWrapperInput } from 'services/ce/services'
import PerspectiveBuilderFilters from '../PerspectiveBuilderFilters/PerspectiveBuilderFilters'
import type { PerspectiveFormValues } from '../PerspectiveBuilder/PerspectiveBuilder'
import css from './PerspectiveFilters.module.scss'

interface PerspectiveFiltersProps {
  formikProps: FormikExtended<PerspectiveFormValues>
}

const PerspectiveFiltersNew: React.FC<PerspectiveFiltersProps> = ({ formikProps }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()
  const { getString } = useStrings()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput]
    }
  })

  const { data } = result

  return (
    <section className={css.filtersContainer}>
      <Text
        color="grey900"
        margin={{
          bottom: 'small'
        }}
        font={{
          size: 'small'
        }}
      >
        {getString('ce.perspectives.createPerspective.filters.rulesTitle')}
      </Text>
      <Text
        margin={{
          bottom: 'xsmall'
        }}
        font={{
          size: 'small'
        }}
        color="grey500"
      >
        {getString('ce.perspectives.createPerspective.filters.rulesText1')}
      </Text>
      <Text
        margin={{
          bottom: 'xsmall'
        }}
        font={{
          size: 'small'
        }}
        color="grey500"
      >
        {getString('ce.perspectives.createPerspective.filters.rulesText2')}
      </Text>

      <FieldArray
        name="viewRules"
        render={arrayHelper => {
          const viewRules = formikProps?.values?.viewRules || []
          return (
            <div>
              {viewRules.map((_, index) => {
                const removeRow: () => void = () => {
                  arrayHelper.remove(index)
                }
                return (
                  <div className={css.filterContainer} key={`multiline-filters-${index}`}>
                    <PerspectiveBuilderFilters
                      fieldValuesList={data?.perspectiveFields?.fieldIdentifierData as QlceViewFieldIdentifierData[]}
                      showAndOperator={true}
                      formikProps={formikProps}
                      index={index}
                      removeEntireRow={removeRow}
                    />
                    <Icon
                      name="trash"
                      size={16}
                      className={css.crossIcon}
                      color={Color.GREY_300}
                      style={{
                        cursor: 'pointer',
                        height: 'fit-content',
                        alignSelf: 'center',
                        transform: 'translateY(-10px)'
                      }}
                      onClick={removeRow}
                    />
                  </div>
                )
              })}
              <div className={cx(css.addFiltersContainer, { [css.noRulesContainer]: !viewRules.length })}>
                <div
                  className={css.addFilters}
                  onClick={() => {
                    arrayHelper.push({
                      conditions: [
                        {
                          type: 'VIEW_ID_CONDITION',
                          viewField: {
                            fieldId: '',
                            fieldName: '',
                            identifier: '',
                            identifierName: ''
                          },
                          operator: 'IN',
                          values: []
                        }
                      ]
                    })
                  }}
                >
                  <Button
                    iconProps={{
                      size: 12
                    }}
                    intent="primary"
                    minimal
                    icon="plus"
                    text={getString('ce.perspectives.createPerspective.filters.addRuleText')}
                    className={css.addRuleButton}
                  />
                </div>
              </div>
            </div>
          )
        }}
      />
    </section>
  )
}

export default PerspectiveFiltersNew

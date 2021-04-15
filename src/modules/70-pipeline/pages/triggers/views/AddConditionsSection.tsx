import React from 'react'
import { FormInput, Text, Icon, Heading, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { useStrings, UseStringsReturn } from 'framework/exports'
import css from './WebhookConditionsPanel.module.scss'

export const mockOperators = [
  { label: '', value: '' },
  { label: 'equals', value: 'equals' },
  { label: 'not equals', value: 'not equals' },
  { label: 'in', value: 'in' },
  { label: 'not in', value: 'not in' },
  { label: 'starts with', value: 'starts with' },
  { label: 'ends with', value: 'ends with' },
  { label: 'regex', value: 'regex' }
]
export interface AddConditionInterface {
  key: string
  operator: string
  value: string
}

interface AddConditionsSectionPropsInterface {
  title: string
  fieldId: string
  formikValues?: { [key: string]: any }
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  errors: { [key: string]: string }
}

interface AddConditionRowInterface {
  fieldId: string
  index: number
  getString: UseStringsReturn['getString']
}

const AddConditionRow: React.FC<AddConditionRowInterface> = ({ fieldId, index, getString }) => (
  <div className={cx(css.conditionsRow, css.addConditionsRow)}>
    <FormInput.Text name={`${fieldId}.${[index]}.key`} label="Attribute" />
    <FormInput.Select items={mockOperators} name={`${fieldId}.${[index]}.operator`} label="Operator" />
    <FormInput.Text
      name={`${fieldId}.${[index]}.value`}
      label={getString('pipeline-triggers.conditionsPanel.matchesValue')}
    />
  </div>
)

export const AddConditionsSection: React.FC<AddConditionsSectionPropsInterface> = ({
  title,
  fieldId,
  formikValues,
  setFieldValue,
  errors
}) => {
  const { getString } = useStrings()
  const addConditions = formikValues?.[fieldId] || []
  return (
    <section data-name={fieldId}>
      <Heading level={2} font={{ weight: 'bold' }}>
        {title}
      </Heading>
      <FieldArray
        name={fieldId}
        render={() => (
          <div style={{ marginTop: '20px' }}>
            {addConditions?.map((_addCondition: AddConditionInterface, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <AddConditionRow index={index} getString={getString} fieldId={fieldId} />
                <Icon
                  style={{
                    position: 'absolute',
                    left: '775px',
                    cursor: 'pointer'
                  }}
                  data-name="main-delete"
                  size={14}
                  color={Color.GREY_500}
                  name="main-delete"
                  onClick={() => {
                    const newAddConditions = [...addConditions]
                    newAddConditions.splice(index, 1)
                    setFieldValue(fieldId, newAddConditions)
                  }}
                />
              </div>
            ))}
            {errors[fieldId] && (
              <Text color={Color.RED_500} style={{ marginBottom: 'var(--spacing-medium)' }}>
                {errors[fieldId]}
              </Text>
            )}
          </div>
        )}
      />
      <Text
        data-name="plusAdd"
        intent="primary"
        style={{ cursor: 'pointer', width: '70px' }}
        onClick={() => {
          const emptyRow = { key: '', operator: '', value: '' }
          if (!addConditions) setFieldValue(fieldId, [emptyRow])
          else setFieldValue(fieldId, [...addConditions, emptyRow])
        }}
      >
        {getString('plusAdd')}
      </Text>
    </section>
  )
}

export default AddConditionsSection

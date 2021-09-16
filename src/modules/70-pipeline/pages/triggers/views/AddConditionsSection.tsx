import React from 'react'
import { FormInput, Text, Icon, Color, Button, ButtonVariation, Container } from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { mockOperators, inNotInArr, inNotInPlaceholder } from '../utils/TriggersWizardPageUtils'
import css from './WebhookConditionsPanel.module.scss'

export interface AddConditionInterface {
  key: string
  operator: string
  value: string
}

interface AddConditionsSectionPropsInterface {
  title: string
  fieldId: string
  attributePlaceholder?: string
  formikValues?: { [key: string]: any }
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  errors: { [key: string]: string }
}

interface AddConditionRowInterface {
  fieldId: string
  index: number
  attributePlaceholder: string
  operatorPlaceholder: string
  valuePlaceholder: string
}

// Has first class support with predefined attribute
export const ConditionRow = ({
  formikProps,
  name,
  label
}: {
  formikProps: any
  name: string
  label: string
}): JSX.Element => {
  const { getString } = useStrings()
  const operatorKey = `${name}Operator`
  const valueKey = `${name}Value`
  const operatorError = formikProps?.errors?.[operatorKey]
  const valueError = formikProps?.errors?.[valueKey]
  const operatorValue = formikProps?.values?.[operatorKey]
  return (
    <div className={cx(css.conditionsRow, css.predefinedRows)}>
      <div>
        <Text style={{ fontSize: 16 }}>{label}</Text>
      </div>
      <FormInput.Select
        style={{ alignSelf: valueError ? 'baseline' : 'center' }}
        className={css.operatorContainer}
        items={mockOperators}
        name={operatorKey}
        label={getString('pipeline.triggers.conditionsPanel.operator').toUpperCase()}
        placeholder={getString('pipeline.operatorPlaceholder')}
        onChange={() => {
          formikProps.setFieldTouched(valueKey, true)
        }}
      />
      <FormInput.Text
        name={valueKey}
        style={{ alignSelf: operatorError ? 'baseline' : 'center' }}
        label={getString('pipeline.triggers.conditionsPanel.matchesValue').toUpperCase()}
        onChange={() => {
          formikProps.setFieldTouched(operatorKey, true)
        }}
        placeholder={
          inNotInArr.includes(operatorValue)
            ? inNotInPlaceholder
            : getString('pipeline.triggers.conditionsPanel.matchesValuePlaceholder')
        }
      />
    </div>
  )
}

const AddConditionRow: React.FC<AddConditionRowInterface> = ({
  fieldId,
  index,
  attributePlaceholder,
  operatorPlaceholder,
  valuePlaceholder
}) => (
  <div className={cx(css.conditionsRow, css.addConditionsRow)}>
    <FormInput.Text
      className={css.textContainer}
      placeholder={attributePlaceholder}
      name={`${fieldId}.${[index]}.key`}
      label=""
    />
    <FormInput.Select
      className={css.operatorContainer}
      placeholder={operatorPlaceholder}
      items={mockOperators}
      name={`${fieldId}.${[index]}.operator`}
      label=""
    />
    <FormInput.Text
      className={css.textContainer}
      name={`${fieldId}.${[index]}.value`}
      label=""
      placeholder={valuePlaceholder}
    />
  </div>
)

export const AddConditionsSection: React.FC<AddConditionsSectionPropsInterface> = ({
  title,
  fieldId,
  attributePlaceholder = '',
  formikValues,
  setFieldValue,
  errors
}) => {
  const { getString } = useStrings()
  const addConditions = formikValues?.[fieldId] || []
  return (
    <section data-name={fieldId}>
      <Text font={{ weight: 'bold' }} color={Color.GREY_800}>
        {title}
      </Text>
      <FieldArray
        name={fieldId}
        render={() => (
          <>
            {addConditions?.length ? (
              <Container className={css.conditionsRowHeaders}>
                <Text font={{ size: 'xsmall', weight: 'bold' }}>
                  {getString('pipeline.triggers.conditionsPanel.attribute').toUpperCase()}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'bold' }}>
                  {getString('pipeline.triggers.conditionsPanel.operator').toUpperCase()}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'bold' }}>
                  {getString('pipeline.triggers.conditionsPanel.matchesValue').toUpperCase()}
                </Text>
              </Container>
            ) : null}
            {addConditions?.map((_addCondition: AddConditionInterface, index: number) => (
              <Container key={index} className={css.rowContainer}>
                <AddConditionRow
                  index={index}
                  fieldId={fieldId}
                  attributePlaceholder={attributePlaceholder}
                  operatorPlaceholder={getString('pipeline.operatorPlaceholder')}
                  valuePlaceholder={
                    inNotInArr.includes(formikValues?.[fieldId]?.[index]?.operator)
                      ? inNotInPlaceholder
                      : getString('pipeline.triggers.conditionsPanel.matchesValuePlaceholder')
                  }
                />
                <Icon
                  className={css.rowTrashIcon}
                  data-name="main-delete"
                  size={14}
                  color={Color.GREY_500}
                  name="main-trash"
                  onClick={() => {
                    const newAddConditions = [...addConditions]
                    newAddConditions.splice(index, 1)
                    setFieldValue(fieldId, newAddConditions)
                  }}
                />
              </Container>
            ))}
            {(addConditions?.length && errors[fieldId] && (
              <Text color={Color.RED_500} style={{ marginBottom: 'var(--spacing-medium)' }}>
                {errors[fieldId]}
              </Text>
            )) ||
              null}
          </>
        )}
      />
      <Button
        variation={ButtonVariation.LINK}
        data-name="plusAdd"
        style={{ padding: 0 }}
        onClick={() => {
          const emptyRow = { key: '', operator: '', value: '' }
          if (!addConditions) setFieldValue(fieldId, [emptyRow])
          else setFieldValue(fieldId, [...addConditions, emptyRow])
        }}
        text={getString('plusAdd')}
      />
    </section>
  )
}

export default AddConditionsSection

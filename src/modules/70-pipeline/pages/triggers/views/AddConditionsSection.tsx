/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Text, Icon, Container, Color, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { useStrings, UseStringsReturn } from 'framework/strings'
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

export const ConditionsRowHeaders = ({ getString }: { getString?: UseStringsReturn['getString'] }) => (
  <Container className={css.conditionsRowHeaders}>
    <Text font={{ size: 'xsmall', weight: 'bold' }}>
      {getString?.('pipeline.triggers.conditionsPanel.attribute').toUpperCase()}
    </Text>
    <Text font={{ size: 'xsmall', weight: 'bold' }}>
      {getString?.('pipeline.triggers.conditionsPanel.operator').toUpperCase()}
    </Text>
    <Text font={{ size: 'xsmall', weight: 'bold' }}>
      {getString?.('pipeline.triggers.conditionsPanel.matchesValue').toUpperCase()}
    </Text>
  </Container>
)
// }

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
      <Text color={Color.GREY_800} data-tooltip-id={name}>
        {label}
        <HarnessDocTooltip tooltipId={name} useStandAlone={true} />
      </Text>
      <FormInput.Select
        style={{ alignSelf: valueError ? 'baseline' : 'center' }}
        className={css.operatorContainer}
        items={mockOperators}
        name={operatorKey}
        label=""
        placeholder={getString('pipeline.operatorPlaceholder')}
        onChange={() => {
          formikProps.setFieldTouched(valueKey, true)
        }}
      />
      <FormInput.Text
        name={valueKey}
        style={{ alignSelf: operatorError ? 'baseline' : 'center' }}
        className={css.textContainer}
        label=""
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
  <div className={cx(css.conditionsRow)}>
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
      <Text className={css.sectionHeader} data-tooltip-id={fieldId}>
        {title}
        <HarnessDocTooltip tooltipId={fieldId} useStandAlone={true} />
      </Text>
      <FieldArray
        name={fieldId}
        render={() => (
          <>
            {addConditions?.length ? <ConditionsRowHeaders getString={getString} /> : null}
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
      <Text
        style={{ cursor: 'pointer', marginTop: 'var(--spacing-small)' }}
        width={43}
        color={Color.PRIMARY_7}
        data-name="plusAdd"
        onClick={() => {
          const emptyRow = { key: '', operator: '', value: '' }
          if (!addConditions) {
            setFieldValue(fieldId, [emptyRow])
          } else {
            setFieldValue(fieldId, [...addConditions, emptyRow])
          }
        }}
      >
        {getString('plusAdd')}
      </Text>
      {/* <Button
        variation={ButtonVariation.LINK}
        data-name="plusAdd"
        style={{ padding: 0, fontWeight: 'normal' }}
        onClick={() => {
          const emptyRow = { key: '', operator: '', value: '' }
          if (!addConditions) setFieldValue(fieldId, [emptyRow])
          else setFieldValue(fieldId, [...addConditions, emptyRow])
        }}
        text={getString('plusAdd')}
      /> */}
    </section>
  )
}

export default AddConditionsSection

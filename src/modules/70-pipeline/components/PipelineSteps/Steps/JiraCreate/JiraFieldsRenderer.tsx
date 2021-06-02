import React from 'react'
import cx from 'classnames'
import { Button, FormInput, Layout } from '@wings-software/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { JiraFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import { setAllowedValuesOptions } from '../JiraApproval/helper'
import type { JiraFieldNGWithValue } from './types'
import css from './JiraCreate.module.scss'

export interface JiraFieldsRendererProps {
  selectedFields?: JiraFieldNGWithValue[]
  readonly?: boolean
  onDelete: (index: number, selectedField: JiraFieldNG) => void
}

const getMappedComponent = (
  selectedField: JiraFieldNG,
  props: JiraFieldsRendererProps,
  expressions: string[],
  index: number
) => {
  if (
    selectedField.schema.type === 'string' ||
    selectedField.schema.type === 'date' ||
    selectedField.schema.type === 'datetime' ||
    selectedField.schema.type === 'number'
  ) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={css.md}
        multiTextInputProps={{
          expressions
        }}
      />
    )
  } else if (selectedField.allowedValues && selectedField.schema.type === 'option' && selectedField.schema.array) {
    return (
      <FormInput.MultiSelectTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={cx(css.multiSelect, css.md)}
        multiSelectTypeInputProps={{
          expressions
        }}
      />
    )
  } else if (selectedField.allowedValues && selectedField.schema.type === 'option') {
    return (
      <FormInput.MultiTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{ expressions }}
      />
    )
  }
  return null
}

export const JiraFieldsRenderer = (props: JiraFieldsRendererProps) => {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, onDelete } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: JiraFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          {getMappedComponent(selectedField, props, expressions, index)}
          <Button
            minimal
            icon="trash"
            disabled={isApprovalStepFieldDisabled(readonly)}
            data-testid={`remove-selectedField-${index}`}
            onClick={() => onDelete(index, selectedField)}
          />
        </Layout.Horizontal>
      ))}
    </>
  ) : null
}

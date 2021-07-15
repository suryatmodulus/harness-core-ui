import React from 'react'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { FormInput, Button, MultiTypeInputType, getMultiTypeFromValue } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { HttpStepFormData, HttpStepHeaderConfig, HttpStepOutputVariable } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HttpStep.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<HttpStepFormData>
  readonly?: boolean
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    formik: { values: formValues, setFieldValue },
    readonly
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.assertion"
          label={getString('assertionLabel')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly }}
        />
        {getMultiTypeFromValue(formValues.spec.assertion) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.assertion}
            type="String"
            variableName="spec.assertion"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.assertion', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.headers"
          label={getString('common.headers')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[{ name: '', type: 'String', value: '', id: uuid() }]}
          disableTypeSelection
        >
          <FieldArray
            name="spec.headers"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.headerRow}>
                    <span className={css.label}>Key</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formValues.spec.headers.map(({ id }: HttpStepHeaderConfig, i: number) => (
                    <div className={css.headerRow} key={id}>
                      <FormInput.Text name={`spec.headers[${i}].key`} disabled={readonly} />
                      <FormInput.MultiTextInput
                        name={`spec.headers[${i}].value`}
                        disabled={readonly}
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          expressions,
                          disabled: readonly
                        }}
                        label=""
                      />
                      <Button
                        minimal
                        icon="main-trash"
                        data-testid={`remove-header-${i}`}
                        onClick={() => remove(i)}
                        disabled={readonly}
                      />
                    </div>
                  ))}
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    data-testid="add-header"
                    onClick={() => push({ key: '', value: '', id: uuid() })}
                    disabled={readonly}
                  >
                    Add
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.outputVariables"
          label={getString('outputLabel')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          disableTypeSelection
        >
          <FieldArray
            name="spec.outputVariables"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.responseMappingRow}>
                    <span className={css.label}>Variable Name</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {((formValues.spec.outputVariables as HttpStepOutputVariable[]) || []).map(
                    ({ id }: HttpStepOutputVariable, i: number) => (
                      <div className={css.responseMappingRow} key={id}>
                        <FormInput.Text name={`spec.outputVariables[${i}].name`} disabled={readonly} />
                        <FormInput.MultiTextInput
                          name={`spec.outputVariables[${i}].value`}
                          disabled={readonly}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            expressions,
                            disabled: readonly
                          }}
                          label=""
                        />
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-response-mapping-${i}`}
                          onClick={() => remove(i)}
                          disabled={readonly}
                        />
                      </div>
                    )
                  )}
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    data-testid="add-response-mapping"
                    onClick={() => push({ name: '', value: '', type: 'String', id: uuid() })}
                    disabled={readonly}
                  >
                    Add
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
    </div>
  )
}

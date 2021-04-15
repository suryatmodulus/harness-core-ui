import React from 'react'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { Button, FormInput, MultiTextInput, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import { useStrings } from 'framework/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ShellScriptFormData, ShellScriptStepVariable } from './shellScriptTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScript.module.scss'

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export default function ShellScriptInput(props: {
  formik: FormikProps<ShellScriptFormData>
  readonly?: boolean
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    readonly
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const updateInputFieldValue = (value: string | number, index: number, path: string): void => {
    if (formValues.spec.environmentVariables?.[index].type === 'Number') {
      value = parseFloat(value as string)
      setFieldValue(path, value)
    } else {
      setFieldValue(path, value)
    }
  }

  return (
    <div className={stepCss.formGroup}>
      <FieldArray
        name="spec.environmentVariables"
        render={({ push, remove }) => {
          return (
            <div className={css.panel}>
              <div className={css.environmentVarHeader}>
                <span className={css.label}>Name</span>
                <span className={css.label}>Type</span>
                <span className={css.label}>Value</span>
              </div>
              {formValues.spec.environmentVariables?.map(({ id }: ShellScriptStepVariable, i: number) => (
                <div className={css.environmentVarHeader} key={id}>
                  <FormInput.Text name={`spec.environmentVariables[${i}].name`} disabled={readonly} />
                  <FormInput.Select
                    items={scriptInputType}
                    name={`spec.environmentVariables[${i}].type`}
                    placeholder={getString('typeLabel')}
                    disabled={readonly}
                  />
                  <MultiTextInput
                    name={`spec.environmentVariables[${i}].value`}
                    expressions={expressions}
                    textProps={{
                      type: formValues.spec.environmentVariables?.[i].type === 'Number' ? 'number' : 'text'
                    }}
                    allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                    value={formValues.spec.environmentVariables?.[i].value as string}
                    onChange={value =>
                      updateInputFieldValue(value as string | number, i, `spec.environmentVariables[${i}].value`)
                    }
                    disabled={readonly}
                  />
                  <Button
                    minimal
                    icon="cross"
                    data-testid={`remove-environmentVar-${i}`}
                    onClick={() => remove(i)}
                    disabled={readonly}
                  />
                </div>
              ))}
              <Button
                icon="plus"
                minimal
                intent="primary"
                data-testid="add-environmentVar"
                disabled={readonly}
                onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
              >
                {getString('addInputVar')}
              </Button>
            </div>
          )
        }}
      />
    </div>
  )
}

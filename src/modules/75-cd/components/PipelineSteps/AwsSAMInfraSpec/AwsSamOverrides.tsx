import React from 'react'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import {
  Button,
  Color,
  FormInput,
  Layout,
  MultiTextInput,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ShellScriptFormData, ShellScriptStepVariable } from '../ShellScriptStep/shellScriptTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../ShellScriptStep/ShellScript.module.scss'

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' }
]

// @ts-ignore
export default function AwsSamOverrides(props: {
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
    if (formValues.spec.overrides?.[index].type === 'Number') {
      value = parseFloat(value as string)
      setFieldValue(path, value)
    } else {
      setFieldValue(path, value)
    }
  }

  return (
    <div className={stepCss.formGroup}>
      <FieldArray
        name="spec.overrides"
        render={({ push, remove }) => {
          return (
            <Layout.Vertical padding={{ bottom: 'medium' }}>
              <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800} padding={{bottom: 'small'}}>
                Overrides
              </Text>
              <div className={css.panel}>
                <div className={css.environmentVarHeader}>
                  <span className={css.label}>Name</span>
                  <span className={css.label}>Type</span>
                  <span className={css.label}>Value</span>
                </div>
                {formValues.spec.overrides?.map(({ id }: ShellScriptStepVariable, i: number) => (
                  <div className={css.environmentVarHeader} key={id}>
                    <FormInput.Text name={`spec.overrides[${i}].name`} disabled={readonly} />
                    <FormInput.Select
                      items={scriptInputType}
                      name={`spec.overrides[${i}].type`}
                      placeholder={getString('typeLabel')}
                      disabled={readonly}
                    />
                    <MultiTextInput
                      name={`spec.overrides[${i}].value`}
                      expressions={expressions}
                      textProps={{
                        type: formValues.spec.overrides?.[i].type === 'Number' ? 'number' : 'text',
                        name: `spec.overrides[${i}].value`
                      }}
                      allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                      value={formValues.spec.overrides?.[i].value as string}
                      onChange={value =>
                        updateInputFieldValue(value as string | number, i, `spec.overrides[${i}].value`)
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
            </Layout.Vertical>
          )
        }}
      />
    </div>
  )
}

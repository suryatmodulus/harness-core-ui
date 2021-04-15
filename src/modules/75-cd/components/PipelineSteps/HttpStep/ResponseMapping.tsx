import React from 'react'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { FormInput, Button, MultiTypeInputType } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/exports'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { HttpStepFormData, HttpStepOutputVariable } from './types'
import css from './HttpStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ResponseMapping(props: {
  formik: FormikProps<HttpStepFormData>
  readonly?: boolean
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    formik: { values: formValues },
    readonly
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.stepPanel}>
        <MultiTypeFieldSelector name="spec.outputVariables" label={getString('outputLabel')} disableTypeSelection>
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
                          icon="trash"
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

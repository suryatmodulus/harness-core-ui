import React from 'react'
import { Text, FormInput, MultiTypeInputType, getMultiTypeFromValue, SelectOption } from '@wings-software/uicore'
import cx from 'classnames'
import { cloneDeep } from 'lodash-es'
import { connect } from 'formik'
import { String } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'
export interface CustomVariablesData {
  variables: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}
export const RegExAllowedInputExpression = /^<\+input>\.(?:allowedValues\((.*?)\))?$/
export interface CustomVariableInputSetExtraProps {
  variableNamePrefix?: string
  domId?: string
  template?: CustomVariablesData
  path?: string
}
export interface CustomVariableInputSetProps extends CustomVariableInputSetExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  inputSetData?: InputSetData<CustomVariablesData>
  formik?: any
}
function CustomVariableInputSetBasic(props: CustomVariableInputSetProps): React.ReactElement {
  const {
    initialValues,
    template,
    stepViewType = StepViewType.Edit,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData,
    formik
  } = props
  const basePath = path?.length ? `${path}.` : ''
  const { expressions } = useVariablesExpression()

  const { executionId } = useQueryParams<Record<string, string>>()

  React.useEffect(() => {
    if (!executionId) {
      const providedValues = formik.values
      let updatedVariables: AllNGVariables[] = cloneDeep(initialValues.variables) || []
      updatedVariables = updatedVariables.map((variable: AllNGVariables, index: number) => {
        const { default: defaultValue = '', ...restVar } = variable
        restVar.value = providedValues?.variables?.[index]?.value || defaultValue
        return restVar
      })
      formik.setFieldValue(`${basePath}variables`, updatedVariables)
    }
  }, [])

  return (
    <div className={cx(css.customVariablesInputSets, 'customVariables')} id={domId}>
      {stepViewType === StepViewType.StageVariable && initialValues.variables.length > 0 && (
        <section className={css.subHeader}>
          <String stringID="name" />
          <String stringID="typeLabel" />
          <String stringID="valueLabel" />
        </section>
      )}
      {template?.variables?.map?.((variable, index) => {
        const value = template?.variables?.[index]?.value || ''
        if (getMultiTypeFromValue(value as string) !== MultiTypeInputType.RUNTIME) {
          return
        }
        const isAllowedValues = RegExAllowedInputExpression.test(value as string)
        const items: SelectOption[] = []
        if (isAllowedValues) {
          const match = (value as string).match(RegExAllowedInputExpression)
          if (match && match?.length > 1) {
            if (variable.type === 'Number') {
              items.push(...match[1].split(',').map(item => ({ label: item, value: parseFloat(item) })))
            } else if (variable.type === 'String') {
              items.push(...match[1].split(',').map(item => ({ label: item, value: item })))
            }
          }
        }
        return (
          <div key={`${variable.name}${index}`} className={css.variableListTable}>
            <Text>{`${variableNamePrefix}${variable.name}`}</Text>
            <Text>{variable.type}</Text>
            <div className={css.valueRow}>
              {variable.type === VariableType.Secret ? (
                <MultiTypeSecretInput
                  expressions={expressions}
                  allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                  name={`${basePath}variables[${index}].value`}
                  label=""
                />
              ) : (
                <>
                  {isAllowedValues ? (
                    <FormInput.MultiTypeInput
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      label=""
                      useValue
                      selectItems={items}
                      multiTypeInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                        expressions,
                        selectProps: { disabled: inputSetData?.readonly, items: items }
                      }}
                      disabled={inputSetData?.readonly}
                    />
                  ) : (
                    <FormInput.MultiTextInput
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      multiTextInputProps={{
                        textProps: { type: variable.type === 'Number' ? 'number' : 'text' },
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                        expressions
                      }}
                      label=""
                      disabled={inputSetData?.readonly}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const CustomVariableInputSet = connect(CustomVariableInputSetBasic)
export { CustomVariableInputSet }

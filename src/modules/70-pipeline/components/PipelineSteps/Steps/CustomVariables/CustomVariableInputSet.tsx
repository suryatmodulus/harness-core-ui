import React from 'react'
import { Text, FormInput, MultiTypeInputType, getMultiTypeFromValue, SelectOption } from '@wings-software/uicore'
import cx from 'classnames'

import { String } from 'framework/exports'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/exports'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'

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
}

export function CustomVariableInputSet(props: CustomVariableInputSetProps): React.ReactElement {
  const {
    initialValues,
    template,
    stepViewType = StepViewType.Edit,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData
  } = props
  const basePath = path?.length ? `${path}.` : ''
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
                <MultiTypeSecretInput isMultiType={false} name={`${basePath}variables[${index}].value`} label="" />
              ) : (
                <>
                  {isAllowedValues ? (
                    <FormInput.Select
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      label=""
                      items={items}
                      disabled={inputSetData?.readonly}
                      selectProps={{ disabled: inputSetData?.readonly }}
                    />
                  ) : (
                    <FormInput.Text
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      inputGroup={{ type: variable.type === 'Number' ? 'number' : 'text' }}
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

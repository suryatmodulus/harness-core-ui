import React from 'react'
import { Text, Button, FormInput, MultiTypeInputType, getMultiTypeFromValue } from '@wings-software/uicore'
import { Formik, FieldArray } from 'formik'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'
import { debounce } from 'lodash-es'

import { String } from 'framework/exports'
import type { StepViewType } from '@pipeline/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { NGVariable } from 'services/cd-ng'
import type { YamlProperties } from 'services/pipeline-ng'
import { toVariableStr } from '@common/utils/StringUtils'
import { CopyText } from '@common/components/CopyText/CopyText'
import type { AllNGVariables } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import AddEditCustomVariable from './AddEditCustomVariable'
import type { VariableState } from './AddEditCustomVariable'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'

export interface CustomVariablesData {
  variables: Array<AllNGVariables & { new?: boolean }>
  isPropagating?: boolean
  canAddVariable?: boolean
}

export interface CustomVariableEditableExtraProps {
  variableNamePrefix?: string
  domId?: string
  heading?: React.ReactNode
  className?: string
  yamlProperties?: YamlProperties[]
  showHeaders?: boolean
}

export interface CustomVariableEditableProps extends CustomVariableEditableExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
}

export function CustomVariableEditable(props: CustomVariableEditableProps): React.ReactElement {
  const { initialValues, onUpdate, variableNamePrefix = '', domId, heading, className, yamlProperties } = props
  const uids = React.useRef<string[]>([])

  const [selectedVariable, setSelectedVariable] = React.useState<VariableState | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce((data: CustomVariablesData) => onUpdate?.(data), 500),
    [onUpdate]
  )

  function addNew(): void {
    setSelectedVariable({
      variable: { name: '', type: 'String', value: '' },
      index: -1
    })
  }
  const { expressions } = useVariablesExpression()

  return (
    <Formik initialValues={initialValues} onSubmit={data => onUpdate?.(data)} validate={debouncedUpdate}>
      {({ values, setFieldValue }) => (
        <FieldArray name="variables">
          {({ remove, push, replace }) => {
            function handleAdd(variable: NGVariable): void {
              uids.current.push(uuid())
              push(variable)
            }

            function handleUpdate(index: number, variable: NGVariable): void {
              replace(index, variable)
            }

            function handleRemove(index: number): void {
              uids.current.splice(index, 1)
              remove(index)
            }

            return (
              <div className={cx(css.customVariables, className)} id={domId}>
                <AddEditCustomVariable
                  addNewVariable={handleAdd}
                  updateVariable={handleUpdate}
                  selectedVariable={selectedVariable}
                  setSelectedVariable={setSelectedVariable}
                />
                {values.canAddVariable ? (
                  <div className={css.headerRow}>
                    {heading ? heading : <div />}
                    <Button minimal intent="primary" icon="plus" onClick={addNew}>
                      <String stringID="common.addVariable" />
                    </Button>
                  </div>
                ) : /* istanbul ignore next */ null}
                {props.showHeaders && values.variables.length > 0 ? (
                  <section className={css.subHeader}>
                    <String stringID="variableLabel" />
                    <String stringID="valueLabel" />
                  </section>
                ) : /* istanbul ignore next */ null}
                {values.variables.map?.((variable, index) => {
                  // generated uuid if they are not present
                  if (!uids.current[index]) {
                    uids.current[index] = uuid()
                  }
                  const key = uids.current[index]
                  const yamlData = yamlProperties?.[index]

                  return (
                    <div key={key} className={css.variableListTable}>
                      {yamlData && yamlData.fqn && yamlData.localName ? (
                        <CopyText textToCopy={toVariableStr(yamlData.fqn)}>
                          <String
                            stringID="customVariables.variableAndType"
                            vars={{ name: yamlData.localName, type: variable.type }}
                          />
                        </CopyText>
                      ) : (
                        <Text lineClamp={1}>
                          <String
                            stringID="customVariables.variableAndType"
                            vars={{ name: `${variableNamePrefix}${variable.name}`, type: variable.type }}
                          />
                        </Text>
                      )}
                      <div className={css.valueRow}>
                        <div>
                          {variable.type === VariableType.Secret ? (
                            <MultiTypeSecretInput name={`variables[${index}].value`} label="" />
                          ) : (
                            <FormInput.MultiTextInput
                              className="variableInput"
                              name={`variables[${index}].value`}
                              label=""
                              multiTextInputProps={{
                                defaultValueToReset: '',
                                expressions,
                                textProps: {
                                  disabled: !initialValues.canAddVariable,
                                  type: variable.type === VariableType.Number ? 'number' : 'text'
                                }
                              }}
                            />
                          )}
                          {getMultiTypeFromValue(variable.value as string) === MultiTypeInputType.RUNTIME ? (
                            <ConfigureOptions
                              value={variable.value as string}
                              defaultValue={variable.default}
                              type={variable.type || /* istanbul ignore next */ 'String'}
                              variableName={variable.name || /* istanbul ignore next */ ''}
                              onChange={(value, defaultValue) => {
                                setFieldValue(`variables[${index}].value`, value)
                                setFieldValue(`variables[${index}].default`, defaultValue)
                              }}
                            />
                          ) : null}
                        </div>
                        <div>
                          {initialValues.canAddVariable ? (
                            <section className={css.actionButtons}>
                              <Button
                                icon="edit"
                                tooltip={<String className={css.tooltip} stringID="common.editVariable" />}
                                data-testid={`edit-variable-${index}`}
                                onClick={() => {
                                  setSelectedVariable({ variable, index })
                                }}
                              />
                              <Button
                                icon="trash"
                                data-testid={`delete-variable-${index}`}
                                tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                                onClick={() => handleRemove(index)}
                              />
                            </section>
                          ) : /* istanbul ignore next */ null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }}
        </FieldArray>
      )}
    </Formik>
  )
}

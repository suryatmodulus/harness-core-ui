import React from 'react'
import { Text, Button, FormInput, MultiTypeInputType, getMultiTypeFromValue } from '@wings-software/uicore'
import { Formik, FieldArray } from 'formik'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import type { StepViewType } from '@pipeline/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { NGVariable } from 'services/cd-ng'
import type { YamlProperties } from 'services/pipeline-ng'
import { toVariableStr } from '@common/utils/StringUtils'
import { CopyText } from '@common/components/CopyText/CopyText'

import AddEditCustomVariable from './AddEditCustomVariable'
import type { VariableState } from './AddEditCustomVariable'
import i18n from './CustomVariables.i18n'
import css from './CustomVariables.module.scss'

export interface CustomVariablesData {
  variables: NGVariable[]
  isPropagating?: boolean
  canAddVariable?: boolean
}

export interface CustomVariableEditableExtraProps {
  variableNamePrefix?: string
  domId?: string
  heading?: React.ReactNode
  className?: string
  yamlProperties?: YamlProperties[]
}

export interface CustomVariableEditableProps extends CustomVariableEditableExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
}

const VariableTypes = {
  String: 'String',
  Secret: 'Secret',
  Number: 'Number'
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
                    <Button minimal intent="primary" icon="plus" text={i18n.addVariable} onClick={addNew} />
                  </div>
                ) : /* istanbul ignore next */ null}
                {values.variables.length > 0 ? (
                  <section className={css.subHeader}>
                    <span>{i18n.variablesTableHeaders.name}</span>
                    <span>{i18n.variablesTableHeaders.type}</span>
                    <span>{i18n.variablesTableHeaders.value}</span>
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
                          <span>{yamlData.localName}</span>
                        </CopyText>
                      ) : (
                        <Text>
                          <span>{`${variableNamePrefix}${variable.name}`}</span>
                        </Text>
                      )}

                      <Text>{variable.type}</Text>
                      <div className={css.valueRow}>
                        <div>
                          {variable.type === VariableTypes.Secret ? (
                            <MultiTypeSecretInput name={`variables[${index}].value`} label="" />
                          ) : (
                            <FormInput.MultiTextInput
                              className="variableInput"
                              name={`variables[${index}].value`}
                              label=""
                              multiTextInputProps={{
                                defaultValueToReset: '',
                                textProps: {
                                  disabled: !initialValues.canAddVariable,
                                  type: variable.type === VariableTypes.Number ? 'number' : 'text'
                                },
                                mentionsInfo: {
                                  data: done =>
                                    done([
                                      'app.name',
                                      'app.description',
                                      'pipeline.name',
                                      'pipeline.description',
                                      'pipeline.identifier',
                                      'pipeline.stage.qa.displayName'
                                    ])
                                }
                              }}
                            />
                          )}
                          {getMultiTypeFromValue(variable.value) === MultiTypeInputType.RUNTIME ? (
                            <ConfigureOptions
                              value={variable.value as string}
                              type={variable.type || /* istanbul ignore next */ 'String'}
                              variableName={variable.name || /* istanbul ignore next */ ''}
                              onChange={value => {
                                setFieldValue(`variables[${index}].value`, value)
                              }}
                            />
                          ) : null}
                        </div>
                        <div>
                          {initialValues.canAddVariable ? (
                            <section className={css.actionButtons}>
                              <Button
                                icon="edit"
                                tooltip={i18n.editVariable}
                                data-testid={`edit-variable-${index}`}
                                onClick={() => {
                                  setSelectedVariable({ variable, index })
                                }}
                              />
                              <Button
                                icon="trash"
                                data-testid={`delete-variable-${index}`}
                                tooltip={i18n.removeThisVariable}
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

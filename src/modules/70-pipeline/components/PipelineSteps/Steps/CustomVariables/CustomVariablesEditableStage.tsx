import React from 'react'
import { debounce } from 'lodash-es'
import { Formik, FieldArray } from 'formik'
import { v4 as uuid } from 'uuid'
import { Button, FormInput, MultiTypeInputType, getMultiTypeFromValue } from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'

import { String, useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { NGVariable } from 'services/cd-ng'

import type { CustomVariableEditableProps, CustomVariablesData } from './CustomVariableEditable'
import { VariableType, labelStringMap } from './CustomVariableUtils'
import AddEditCustomVariable, { VariableState } from './AddEditCustomVariable'
import css from './CustomVariables.module.scss'

const getValidationSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object().shape({
    variables: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().trim().required(getString('common.validation.nameIsRequired')),
        value: Yup.mixed().required(getString('common.validation.valueIsRequired'))
      })
    )
  })

export function CustomVariablesEditableStage(props: CustomVariableEditableProps): React.ReactElement {
  const { initialValues, onUpdate, domId, className, yamlProperties, enableValidation, readonly } = props
  const uids = React.useRef<string[]>([])
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

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
    <Formik
      initialValues={initialValues}
      onSubmit={data => onUpdate?.(data)}
      validate={debouncedUpdate}
      validationSchema={enableValidation ? getValidationSchema(getString) : undefined}
    >
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
              <div className={cx(css.customVariablesStage, className)} id={domId}>
                <AddEditCustomVariable
                  selectedVariable={selectedVariable}
                  setSelectedVariable={setSelectedVariable}
                  addNewVariable={handleAdd}
                  updateVariable={handleUpdate}
                  existingVariables={values.variables}
                />
                {values.variables?.length > 0 ? (
                  <div className={cx(css.tableRow, css.headerRow)}>
                    <String stringID="name" />
                    <String stringID="typeLabel" />
                    <String stringID="valueLabel" />
                    <div />
                  </div>
                ) : null}
                {values.variables.map?.((variable, index) => {
                  // generated uuid if they are not present
                  if (!uids.current[index]) {
                    uids.current[index] = uuid()
                  }
                  const key = uids.current[index]
                  const yamlData = yamlProperties?.[index] || {}

                  return (
                    <div key={key} className={css.tableRow}>
                      <TextInputWithCopyBtn
                        name={`variables[${index}].name`}
                        label=""
                        disabled={true}
                        localName={yamlData.localName}
                        fullName={yamlData.fqn}
                      />
                      <String
                        className={css.valueString}
                        stringID={labelStringMap[variable.type as VariableType]}
                        data-testid={`variables[${index}].type`}
                      />
                      <div className={css.valueColumn} data-type={getMultiTypeFromValue(variable.value as string)}>
                        {variable.type === VariableType.Secret ? (
                          <MultiTypeSecretInput name={`variables[${index}].value`} label="" disabled={readonly} />
                        ) : (
                          <FormInput.MultiTextInput
                            className="variableInput"
                            name={`variables[${index}].value`}
                            label=""
                            disabled={readonly}
                            multiTextInputProps={{
                              defaultValueToReset: '',
                              expressions,
                              textProps: {
                                disabled: !initialValues.canAddVariable || readonly,
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
                            isReadonly={readonly}
                          />
                        ) : null}
                        <div className={css.actionButtons}>
                          {initialValues.canAddVariable ? (
                            <React.Fragment>
                              <Button
                                icon="edit"
                                disabled={readonly}
                                tooltip={<String className={css.tooltip} stringID="common.editVariableType" />}
                                data-testid={`edit-variable-${index}`}
                                onClick={() => setSelectedVariable({ variable, index })}
                                minimal
                              />
                              <Button
                                icon="trash"
                                disabled={readonly}
                                data-testid={`delete-variable-${index}`}
                                tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                                onClick={() => handleRemove(index)}
                                minimal
                              />
                            </React.Fragment>
                          ) : /* istanbul ignore next */ null}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {values.canAddVariable ? (
                  <Button
                    test-id={'add-variable'}
                    minimal
                    intent="primary"
                    icon="plus"
                    onClick={addNew}
                    disabled={readonly}
                    data-testid={'add-variable'}
                  >
                    <String stringID="common.addVariable" />
                  </Button>
                ) : /* istanbul ignore next */ null}
              </div>
            )
          }}
        </FieldArray>
      )}
    </Formik>
  )
}

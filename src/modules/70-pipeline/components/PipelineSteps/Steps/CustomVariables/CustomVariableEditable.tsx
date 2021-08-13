import React from 'react'
import {
  Text,
  Button,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  useNestedAccordion
} from '@wings-software/uicore'
import { Formik, FieldArray } from 'formik'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'
import { debounce } from 'lodash-es'

import { String } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { NGVariable } from 'services/cd-ng'
import type { YamlProperties } from 'services/pipeline-ng'
import { toVariableStr } from '@common/utils/StringUtils'
import { CopyText } from '@common/components/CopyText/CopyText'
import type { AllNGVariables } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import {
  getTextWithSearchMarkers,
  usePipelineVariables
} from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import AddEditCustomVariable from './AddEditCustomVariable'
import type { VariableState } from './AddEditCustomVariable'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'

export interface CustomVariablesData {
  variables: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}

export interface CustomVariableEditableExtraProps {
  variableNamePrefix?: string
  domId?: string
  tabName?: string
  heading?: React.ReactNode
  className?: string
  yamlProperties?: YamlProperties[]
  showHeaders?: boolean
  enableValidation?: boolean
  path?: string
}

export interface CustomVariableEditableProps extends CustomVariableEditableExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  readonly?: boolean
}

export function CustomVariableEditable(props: CustomVariableEditableProps): React.ReactElement {
  const { initialValues, onUpdate, domId, heading, className, yamlProperties, readonly, path } = props
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

  const { searchText, searchIndex, searchResults = [] } = usePipelineVariables()
  const searchedEntity = searchResults[searchIndex || 0] || {}
  const updatedPath = path?.replace('pipeline.', '')
  const tableRef = React.useRef()
  const { openNestedPath } = useNestedAccordion()

  React.useLayoutEffect(() => {
    if (tableRef.current) {
      const { testid: accordianId = '', open } =
        (tableRef?.current as any)?.closest?.('.Accordion--panel')?.dataset || {}

      if (open === 'false') {
        openNestedPath(accordianId?.replace('-panel', ''))
        setTimeout(() => {
          document?.querySelector('span.selected-search-text')?.scrollIntoView({ behavior: 'smooth' })
        }, 500)
      } else {
        const highlightedNode =
          (tableRef?.current as any)?.querySelector('span.selected-search-text') ||
          (tableRef?.current as any)?.querySelector('div.selected-search-text')

        highlightedNode?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchIndex, openNestedPath, searchText])
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
              <div className={cx(css.customVariables, className)} id={domId} ref={tableRef as any}>
                <AddEditCustomVariable
                  addNewVariable={handleAdd}
                  updateVariable={handleUpdate}
                  selectedVariable={selectedVariable}
                  setSelectedVariable={setSelectedVariable}
                  existingVariables={values.variables}
                />
                {values.canAddVariable ? (
                  <div className={css.headerRow}>
                    {heading ? heading : <div />}
                    <Button minimal intent="primary" icon="plus" onClick={addNew} disabled={readonly}>
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
                  const vairableNameParts = yamlData?.localName?.split('.') || []
                  const variableName = vairableNameParts[vairableNameParts.length - 1]
                  const hasSameMetaPath = searchedEntity.path === `${updatedPath}[${index}].value`
                  const searchedEntityType = searchedEntity.type || null

                  const isValidValueMatch = `${variable?.value}`
                    ?.toLowerCase()
                    ?.includes(searchText?.toLowerCase() || '')

                  return (
                    <div key={key} className={css.variableListTable}>
                      {yamlData && yamlData.fqn && yamlData.localName ? (
                        <CopyText className="variable-name-cell" textToCopy={toVariableStr(yamlData.fqn)}>
                          <span
                            className={cx({
                              'selected-search-text': searchedEntityType === 'key' && hasSameMetaPath
                            })}
                            dangerouslySetInnerHTML={{
                              __html: getTextWithSearchMarkers({
                                searchText,
                                txt: variableName,
                                className: cx(css.selectedSearchText, {
                                  [css.currentSelection]: searchedEntityType === 'key' && hasSameMetaPath
                                })
                              })
                            }}
                          />
                        </CopyText>
                      ) : (
                        <Text className="variable-name-cell" lineClamp={1}>
                          <span
                            className={cx({
                              [css.selectedSearchTextValueRow]: searchedEntityType === 'key' && hasSameMetaPath,
                              'selected-search-text': searchedEntityType === 'key' && hasSameMetaPath
                            })}
                            dangerouslySetInnerHTML={{
                              __html: getTextWithSearchMarkers({ searchText, txt: variable.name })
                            }}
                          />
                        </Text>
                      )}
                      <div
                        className={cx(css.valueRow, 'variable-value-cell', {
                          [css.selectedSearchTextValueRow]: searchText?.length && isValidValueMatch,
                          'selected-search-text': searchedEntityType === 'value' && hasSameMetaPath
                        })}
                      >
                        <div>
                          {variable.type === VariableType.Secret ? (
                            <MultiTypeSecretInput
                              small
                              name={`variables[${index}].value`}
                              label=""
                              disabled={readonly}
                            />
                          ) : (
                            <FormInput.MultiTextInput
                              className="variableInput"
                              name={`variables[${index}].value`}
                              label=""
                              disabled={readonly}
                              multiTextInputProps={{
                                mini: true,
                                defaultValueToReset: '',
                                expressions,
                                width: 264,
                                textProps: {
                                  disabled: !initialValues.canAddVariable || readonly,
                                  type: variable.type === VariableType.Number ? 'number' : 'text'
                                }
                              }}
                              data-testid="variables-test"
                            />
                          )}
                        </div>
                        <div className={css.actionButtons}>
                          <section className={cx(css.actionButtons, css.alignIcons)}>
                            {initialValues.canAddVariable ? (
                              <>
                                <Button
                                  icon="edit"
                                  tooltip={<String className={css.tooltip} stringID="common.editVariable" />}
                                  data-testid={`edit-variable-${index}`}
                                  disabled={readonly}
                                  onClick={() => {
                                    setSelectedVariable({ variable, index })
                                  }}
                                  minimal
                                />
                                <Button
                                  icon="main-trash"
                                  data-testid={`delete-variable-${index}`}
                                  tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                                  disabled={readonly}
                                  onClick={() => handleRemove(index)}
                                  minimal
                                />
                              </>
                            ) : /* istanbul ignore next */ null}
                          </section>
                          <div className={cx(css.alignIcons, css.configureButton)}>
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
                          </div>
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

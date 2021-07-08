import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Container,
  Text,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray, FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { v4 as uuid } from 'uuid'
import type { IOptionProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './K8sDelete.module.scss'

const DeleteSpecConstant = {
  ResourceName: 'ResourceName',
  ReleaseName: 'ReleaseName',
  ManifestPath: 'ManifestPath'
}

interface K8sDeleteFormSpec {
  resourceNames?: string[] | K8sDeleteConfigHeader[]
  deleteNamespace?: boolean
  manifestPaths?: string[] | K8sDeleteConfigHeader[]
  skipDryRun?: boolean
}
interface K8sDeleteSpec {
  resourceNames?: K8sDeleteConfigHeader[]
  deleteNamespace?: boolean
  manifestPaths?: K8sDeleteConfigHeader[]
  skipDryRun?: boolean
}

interface K8sDeleteConfigHeader {
  id: string
  value: string
}

export interface K8sDeleteData extends StepElementConfig {
  spec: {
    deleteResources: {
      type?: string
      spec: K8sDeleteSpec
    }
  }
}

export interface K8sDeleteFormData extends StepElementConfig {
  spec: {
    deleteResources: {
      type?: string
      spec: K8sDeleteFormSpec
    }
  }
}

export interface K8sDeleteVariableStepProps {
  initialValues: K8sDeleteData
  stageIdentifier: string
  onUpdate?: (data: K8sDeleteData) => void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sDeleteData
}

interface K8sDeleteProps {
  initialValues: K8sDeleteData
  onUpdate?: (data: K8sDeleteData) => void
  isDisabled?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: K8sDeleteData
    path?: string
  }
  readonly?: boolean
}

function K8sDeleteDeployWidget(props: K8sDeleteProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, isDisabled } = props
  const { getString } = useStrings()

  const accessTypeOptions = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const options: IOptionProps[] = [
      {
        label: getString('pipelineSteps.resourceNameLabel'),
        value: getString('pipelineSteps.resourceNameValue')
      },
      {
        label: getString('pipelineSteps.manifestPathLabel'),
        value: getString('pipelineSteps.manifestPathValue')
      },
      {
        label: getString('pipelineSteps.releaseNameLabel'),
        value: getString('pipelineSteps.releaseNameValue')
      }
    ]
    return options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (values: K8sDeleteData, value: string): K8sDeleteData => {
    let obj = values
    if (value === getString('pipelineSteps.manifestPathValue')) {
      obj = {
        ...values,
        spec: {
          deleteResources: {
            type: value,
            spec: {
              manifestPaths: [{ value: '', id: uuid() }]
            }
          }
        }
      }
    } else if (value === getString('pipelineSteps.resourceNameValue')) {
      obj = {
        ...values,
        spec: {
          deleteResources: {
            type: value,
            spec: {
              resourceNames: [{ value: '', id: uuid() }]
            }
          }
        }
      }
    } else if (value === getString('pipelineSteps.releaseNameValue')) {
      obj = {
        ...values,
        spec: {
          deleteResources: {
            type: value,
            spec: {
              deleteNamespace: false
            }
          }
        }
      }
    }

    return obj
  }

  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<K8sDeleteData>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        formName="k8DeleteData"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          identifier: IdentifierSchema()
        })}
      >
        {(formikProps: FormikProps<K8sDeleteData>) => {
          setFormikRef(formikRef, formikProps)
          const values = formikProps.values
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{ disabled: isDisabled }}
                  />
                </div>
                <div className={stepCss.formGroup}>
                  <FormInput.RadioGroup
                    label={getString('pipelineSteps.deleteResourcesBy')}
                    name="spec.deleteResources.type"
                    items={accessTypeOptions}
                    radioGroup={{ inline: true, disabled: isDisabled }}
                    onChange={e => {
                      const currentValue = e.currentTarget?.value

                      const valuesObj = onChange(values, currentValue)
                      formikProps?.setValues({ ...valuesObj })
                    }}
                  />
                </div>

                {values?.spec?.deleteResources?.type === getString('pipelineSteps.resourceNameValue') && (
                  <div className={stepCss.formGroup}>
                    <FieldArray
                      name="spec.deleteResources.spec.resourceNames"
                      render={arrayHelpers => (
                        <Layout.Vertical>
                          {formikProps.values?.spec?.deleteResources?.spec?.resourceNames?.map(
                            (_path: K8sDeleteConfigHeader, index: number) => (
                              <Layout.Horizontal
                                key={_path.id}
                                flex={{ distribution: 'space-between' }}
                                style={{ alignItems: 'end' }}
                              >
                                <FormInput.MultiTextInput
                                  label=""
                                  placeholder={getString('pipelineSteps.deleteResourcesPlaceHolder')}
                                  name={`spec.deleteResources.spec.resourceNames[${index}].value`}
                                  style={{ width: '430px' }}
                                  multiTextInputProps={{ expressions, textProps: { disabled: isDisabled } }}
                                />
                                {/* istanbul ignore next */}
                                {formikProps.values?.spec?.deleteResources?.spec?.resourceNames && (
                                  <Button
                                    minimal
                                    icon="minus"
                                    onClick={() => {
                                      /* istanbul ignore next */
                                      arrayHelpers.remove(index)
                                    }}
                                    disabled={isDisabled}
                                  />
                                )}
                              </Layout.Horizontal>
                            )
                          )}
                          <span>
                            <Button
                              minimal
                              text={getString('plusAdd')}
                              intent="primary"
                              className={css.addBtn}
                              onClick={() => {
                                /* istanbul ignore next */
                                arrayHelpers.push({ value: '', id: uuid() })
                              }}
                              disabled={isDisabled}
                            />
                          </span>
                        </Layout.Vertical>
                      )}
                    />
                  </div>
                )}

                {values?.spec?.deleteResources?.type === getString('pipelineSteps.releaseNameValue') && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormMultiTypeCheckboxField
                      name="spec.deleteResources.spec.deleteNamespace"
                      label={getString('pipelineSteps.deleteNamespace')}
                      style={{ paddingLeft: 'var(--spacing-small)', fontSize: 'var(--font-size-small)' }}
                      multiTypeTextbox={{ expressions }}
                      disabled={isDisabled}
                    />
                  </div>
                )}

                {values?.spec?.deleteResources?.type === getString('pipelineSteps.manifestPathValue') && (
                  <div className={stepCss.formGroup}>
                    <FieldArray
                      name="spec.deleteResources.spec.manifestPaths"
                      render={arrayHelpers => (
                        <Layout.Vertical>
                          {/* istanbul ignore next */}
                          {(formikProps.values?.spec?.deleteResources?.spec?.manifestPaths || [])?.map(
                            (_path: K8sDeleteConfigHeader, index: number) => (
                              <Layout.Horizontal
                                key={_path.id}
                                flex={{ distribution: 'space-between' }}
                                style={{ alignItems: 'end' }}
                              >
                                <FormInput.MultiTextInput
                                  label=""
                                  placeholder={getString('pipelineSteps.manifestPathsPlaceHolder')}
                                  name={`spec.deleteResources.spec.manifestPaths[${index}].value`}
                                  style={{ width: '430px' }}
                                  multiTextInputProps={{
                                    expressions,
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                    disabled: isDisabled
                                  }}
                                />

                                {/* istanbul ignore next */}
                                {formikProps.values?.spec?.deleteResources?.spec?.manifestPaths && (
                                  <Button
                                    minimal
                                    icon="minus"
                                    onClick={() => arrayHelpers.remove(index)}
                                    disabled={isDisabled}
                                  />
                                )}
                              </Layout.Horizontal>
                            )
                          )}
                          <span>
                            <Button
                              minimal
                              text={getString('addFileText')}
                              className={css.addBtn}
                              intent="primary"
                              disabled={isDisabled}
                              onClick={() => arrayHelpers.push({ value: '', id: uuid() })}
                            />
                          </span>
                        </Layout.Vertical>
                      )}
                    />
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                    <FormMultiTypeDurationField
                      name="timeout"
                      label={getString('pipelineSteps.timeoutLabel')}
                      multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: isDisabled }}
                    />
                    {getMultiTypeFromValue(formikProps.values.timeout) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={values.timeout as string}
                        type="String"
                        variableName="step.timeout"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formikProps.setFieldValue('timeout', value)
                        }}
                        isReadonly={isDisabled}
                      />
                    )}
                  </Layout.Horizontal>
                </div>
              </Layout.Vertical>

              {formikProps?.values?.spec?.deleteResources?.type === DeleteSpecConstant.ReleaseName &&
                formikProps?.values?.spec?.deleteResources?.spec?.deleteNamespace && (
                  <Container
                    id="warning-deletenamespace"
                    intent="warning"
                    padding="medium"
                    font={{
                      align: 'center'
                    }}
                    background="red200"
                    flex
                    border={{
                      color: 'red500'
                    }}
                  >
                    <Text>{getString('pipelineSteps.deleteNamespaceWarning')}</Text>
                  </Container>
                )}
            </>
          )
        }}
      </Formik>
    </>
  )
}

/* istanbul ignore next */
const K8sDeleteInputStep: React.FC<K8sDeleteProps> = ({ inputSetData, readonly }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}

const K8sDeleteVariableStep: React.FC<K8sDeleteVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8sDeleteDeployWidgetWithRef = React.forwardRef(K8sDeleteDeployWidget)

export class K8sDeleteStep extends PipelineStep<K8sDeleteFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<any>): JSX.Element {
    /* istanbul ignore next */

    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      /* istanbul ignore next */
      return (
        <K8sDeleteInputStep
          initialValues={initialValues}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          onUpdate={onUpdate}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sDeleteVariableStep
          {...(customStepProps as K8sDeleteVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    /* istanbul ignore next */

    return (
      <K8sDeleteDeployWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={!!inputSetData?.readonly}
        ref={formikRef}
        isDisabled={readonly}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sDeleteFormData>): FormikErrors<K8sDeleteFormData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: FormikErrors<K8sDeleteFormData> = {}
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }
    return errors
  }
  //TODO : to remove any
  private getInitialValues(initialValues: any): K8sDeleteData {
    if (initialValues.spec?.deleteResources?.type === DeleteSpecConstant.ResourceName) {
      return {
        ...initialValues,
        spec: {
          deleteResources: {
            type: DeleteSpecConstant.ResourceName,
            spec: {
              resourceNames: (initialValues.spec?.deleteResources?.spec?.resourceNames || []).map((item: any) => ({
                value: item,
                id: uuid()
              }))
            }
          }
        }
      }
    } else if (initialValues.spec?.deleteResources?.type === DeleteSpecConstant.ManifestPath) {
      return {
        ...initialValues,
        spec: {
          deleteResources: {
            type: DeleteSpecConstant.ManifestPath,
            spec: {
              manifestPaths: (initialValues.spec?.deleteResources?.spec?.manifestPaths || []).map((item: any) => ({
                value: item,
                id: uuid()
              }))
            }
          }
        }
      }
    } else {
      return {
        ...initialValues,
        spec: {
          deleteResources: {
            type: DeleteSpecConstant.ReleaseName,
            spec: {
              deleteNamespace: initialValues.spec?.deleteResources?.spec?.deleteNamespace || false
            }
          }
        }
      }
    }
  }
  // TODO: remove any
  processFormData(data: any): K8sDeleteFormData {
    /* making sure to remove other entities */
    if (data.spec?.deleteResources?.type === DeleteSpecConstant.ResourceName) {
      /* istanbul ignore next */
      delete data.spec?.deleteResources?.spec?.deleteNamespace
      delete data.spec?.deleteResources?.spec?.manifestPaths
      return {
        ...data,
        spec: {
          deleteResources: {
            type: DeleteSpecConstant.ResourceName,
            spec: {
              resourceNames: (data.spec?.deleteResources?.spec?.resourceNames || []).map((item: any) => item.value)
            }
          }
        }
      }
    } else if (data.spec?.deleteResources?.type === DeleteSpecConstant.ManifestPath) {
      /* istanbul ignore next */
      delete data.spec?.deleteResources?.spec?.deleteNamespace
      delete data.spec?.deleteResources?.spec?.resourceNames
      return {
        ...data,
        spec: {
          deleteResources: {
            type: DeleteSpecConstant.ManifestPath,
            spec: {
              manifestPaths: (data.spec?.deleteResources?.spec?.manifestPaths || []).map((item: any) => item.value)
            }
          }
        }
      }
    }

    /* istanbul ignore next */
    delete data.spec?.deleteResources?.spec?.resourceNames
    delete data.spec?.deleteResources?.spec?.manifestPaths
    return {
      ...data,
      spec: {
        deleteResources: {
          type: DeleteSpecConstant.ReleaseName,
          spec: {
            deleteNamespace: data.spec?.deleteResources?.spec?.deleteNamespace as boolean
          }
        }
      }
    }
  }

  protected type = StepType.K8sDelete
  protected stepName = 'K8s Delete'
  protected stepIcon: IconName = 'delete'
  protected isHarnessSpecific = true

  protected defaultValues: K8sDeleteFormData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.K8sDelete,
    spec: {
      deleteResources: {
        type: '',
        spec: {}
      }
    }
  }
}

import React from 'react'
import { IconName, Formik, Layout, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import type {
  CountInstanceSelection,
  K8sScaleStepInfo,
  PercentageInstanceSelection,
  StepElementConfig
} from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { FormInstanceDropdown, FormMultiTypeCheckboxField } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings, UseStringsReturn } from 'framework/exports'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sScaleData extends StepElementConfig {
  spec: K8sScaleStepInfo
  identifier: string
}

export interface K8sScaleVariableStepProps {
  initialValues: K8sScaleData
  stageIdentifier: string
  onUpdate?(data: K8sScaleData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sScaleData
}

interface K8sScaleProps {
  initialValues: K8sScaleData
  onUpdate?: (data: K8sScaleData) => void
  stepViewType?: StepViewType
  template?: K8sScaleData
  readonly?: boolean
  path?: string
}

function K8ScaleDeployWidget(props: K8sScaleProps, formikRef: StepFormikFowardRef<K8sScaleData>): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<K8sScaleData>
        onSubmit={(values: K8sScaleData) => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),

          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            instanceSelection: getInstanceDropdownSchema()
          }),
          ...IdentifierValidation()
        })}
      >
        {(formik: FormikProps<K8sScaleData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isEmpty(initialValues.identifier)}
                  />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInstanceDropdown
                    name={'spec.instanceSelection'}
                    label={getString('pipelineSteps.instanceLabel')}
                  />
                  {(getMultiTypeFromValue(
                    (values?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count
                  ) === MultiTypeInputType.RUNTIME ||
                    getMultiTypeFromValue(
                      (values?.spec?.instanceSelection?.spec as PercentageInstanceSelection | undefined)?.percentage
                    ) === MultiTypeInputType.RUNTIME) && (
                    <ConfigureOptions
                      value={
                        ((values?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)
                          ?.count as string) ||
                        ((values?.spec?.instanceSelection?.spec as PercentageInstanceSelection | undefined)
                          ?.percentage as string)
                      }
                      type="String"
                      variableName={getString('instanceFieldOptions.instances')}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('instances', value)
                      }}
                    />
                  )}
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput label={getString('pipelineSteps.workload')} name={'spec.workload'} />
                  {getMultiTypeFromValue(values.spec.workload) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.spec.workload as string}
                      type="String"
                      variableName={getString('pipelineSteps.workload')}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('spec.workload', value)
                      }}
                    />
                  )}
                </div>

                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    className={stepCss.duration}
                    multiTypeDurationProps={{ enableConfigureOptions: false }}
                  />
                  {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.timeout as string}
                      type="String"
                      variableName="step.timeout"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('timeout', value)
                      }}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.skipSteadyStateCheck"
                    label={getString('pipelineSteps.skipSteadyStateCheck')}
                  />
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8ScaleInputStep: React.FC<K8sScaleProps> = ({ template, readonly, path }) => {
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.spec?.workload) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text name="spec.workload" label={getString('pipelineSteps.workload')} disabled={readonly} />
      )}
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
        />
      ) : null}
      {(getMultiTypeFromValue(
        (template?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count
      ) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(
          (template?.spec?.instanceSelection?.spec as PercentageInstanceSelection | undefined)?.percentage
        ) === MultiTypeInputType.RUNTIME) && (
        <FormInstanceDropdown
          label={getString('pipelineSteps.instanceLabel')}
          name={`${prefix}spec.instanceSelection`}
          disabledType
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.skipSteadyStateCheck) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${prefix}spec.skipSteadyStateCheck`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipSteadyStateCheck')}
          disabled={readonly}
        />
      )}
    </>
  )
}

const K8sScaleVariableStep: React.FC<K8sScaleVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8ScaleDeployWidgetWithRef = React.forwardRef(K8ScaleDeployWidget)
export class K8sScaleStep extends PipelineStep<K8sScaleData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  renderStep(props: StepProps<K8sScaleData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8ScaleInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={inputSetData?.readonly}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sScaleVariableStep
          {...(customStepProps as K8sScaleVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8ScaleDeployWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.K8sScale
  protected stepName = 'K8s Scale'

  protected stepIcon: IconName = 'swap-vertical'
  protected isHarnessSpecific = true
  /* istanbul ignore next */
  validateInputSet(data: K8sScaleData, template: K8sScaleData, getString?: UseStringsReturn['getString']): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
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
    } else if (
      getMultiTypeFromValue((template?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count) ===
        MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(
        (template?.spec?.instanceSelection?.spec as PercentageInstanceSelection | undefined)?.percentage
      ) === MultiTypeInputType.RUNTIME
    ) {
      const instanceSelection = Yup.object().shape({
        instanceSelection: getInstanceDropdownSchema({
          required: true,
          requiredErrorMessage: getString?.('fieldRequired', { field: 'Instance' })
        })
      })

      try {
        instanceSelection.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors.spec, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  protected defaultValues: K8sScaleData = {
    identifier: '',
    timeout: '10m',
    spec: {
      workload: '',
      skipSteadyStateCheck: false,
      instanceSelection: { type: InstanceTypes.Instances, spec: { count: 0 } as any }
    }
  }
}

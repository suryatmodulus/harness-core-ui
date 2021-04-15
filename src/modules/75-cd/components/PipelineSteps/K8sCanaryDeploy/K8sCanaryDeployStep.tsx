import React from 'react'
import { IconName, Formik, FormInput, Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { K8sRollingStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { FormMultiTypeCheckboxField, FormInstanceDropdown } from '@common/components'
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

export interface K8sCanaryDeployData extends StepElementConfig {
  spec: K8sRollingStepInfo
  identifier: string
}

export interface K8sCanaryDeployVariableStepProps {
  initialValues: K8sCanaryDeployData
  stageIdentifier: string
  onUpdate?(data: K8sCanaryDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sCanaryDeployData
}

interface K8sCanaryDeployProps {
  initialValues: K8sCanaryDeployData
  onUpdate?: (data: K8sCanaryDeployData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: K8sCanaryDeployData
  readonly?: boolean
  path?: string
}

function K8CanaryDeployWidget(
  props: K8sCanaryDeployProps,
  formikRef: StepFormikFowardRef<K8sCanaryDeployData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<K8sCanaryDeployData>
        onSubmit={(values: K8sCanaryDeployData) => {
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
        {(formik: FormikProps<K8sCanaryDeployData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInstanceDropdown
                  name={'spec.instanceSelection'}
                  label={getString('pipelineSteps.instanceLabel')}
                  readonly={readonly}
                />
                {(getMultiTypeFromValue(values?.spec?.instanceSelection?.spec?.count) === MultiTypeInputType.RUNTIME ||
                  getMultiTypeFromValue(values?.spec?.instanceSelection?.spec?.percentage) ===
                    MultiTypeInputType.RUNTIME) && (
                  <ConfigureOptions
                    value={
                      (values?.spec?.instanceSelection?.spec?.count as string) ||
                      (values?.spec?.instanceSelection?.spec?.percentage as string)
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

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{ enableConfigureOptions: false, disabled: readonly }}
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
                  name="spec.skipDryRun"
                  label={getString('pipelineSteps.skipDryRun')}
                  disabled={readonly}
                />
              </div>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const K8CanaryDeployInputStep: React.FC<K8sCanaryDeployProps> = ({ template, readonly, path }) => {
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${prefix}spec.skipDryRun`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipDryRun')}
          disabled={readonly}
        />
      )}
      {(getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.count) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.percentage) === MultiTypeInputType.RUNTIME) && (
        <FormInstanceDropdown
          label={getString('pipelineSteps.instanceLabel')}
          name={`${prefix}spec.instanceSelection`}
          disabledType
          disabled={readonly}
        />
      )}
    </>
  )
}

const K8sCanaryDeployVariableStep: React.FC<K8sCanaryDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8CanaryDeployWidgetWithRef = React.forwardRef(K8CanaryDeployWidget)
export class K8sCanaryDeployStep extends PipelineStep<K8sCanaryDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<K8sCanaryDeployData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8CanaryDeployInputStep
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
        <K8sCanaryDeployVariableStep
          {...(customStepProps as K8sCanaryDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8CanaryDeployWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  protected type = StepType.K8sCanaryDeploy
  protected stepName = 'K8s Canary Deploy'

  protected stepIcon: IconName = 'canary'
  protected isHarnessSpecific = true
  validateInputSet(
    data: K8sCanaryDeployData,
    template: K8sCanaryDeployData,
    getString?: UseStringsReturn['getString']
  ): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    } else if (
      getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.count) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.percentage) === MultiTypeInputType.RUNTIME
    ) {
      const instanceSelection = Yup.object().shape({
        instanceSelection: getInstanceDropdownSchema({
          required: true,
          requiredErrorMessage: getString?.('fieldRequired', { field: 'Instance' })
        })
      })

      try {
        instanceSelection.validateSync(data)
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
  protected defaultValues: K8sCanaryDeployData = {
    identifier: '',
    timeout: '10m',
    spec: {
      skipDryRun: false,
      instanceSelection: {
        type: InstanceTypes.Instances,
        spec: { count: 1 }
      }
    }
  }
}

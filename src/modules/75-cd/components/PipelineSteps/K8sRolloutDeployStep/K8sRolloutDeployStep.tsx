import React from 'react'
import { IconName, Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'

import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { K8sRollingStepInfo, StepElementConfig } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8RolloutDeployData extends StepElementConfig {
  spec: Omit<K8sRollingStepInfo, 'skipDryRun'> & {
    skipDryRun?: boolean
  }
}

interface K8RolloutDeployProps {
  initialValues: K8RolloutDeployData
  onUpdate?: (data: K8RolloutDeployData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  isNewStep?: boolean
  inputSetData?: {
    template?: K8RolloutDeployData
    path?: string
    readonly?: boolean
  }
}

function K8RolloutDeployWidget(
  props: K8RolloutDeployProps,
  formikRef: StepFormikFowardRef<K8RolloutDeployData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly } = props
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  return (
    <>
      <Formik<K8RolloutDeployData>
        onSubmit={(values: K8RolloutDeployData) => {
          onUpdate?.(values)
        }}
        formName="k8RolloutDeploy"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          identifier: IdentifierSchema()
        })}
      >
        {(formik: FormikProps<K8RolloutDeployData>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep && !readonly}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: readonly }}
                  disabled={readonly}
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
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeCheckboxField
                  multiTypeTextbox={{ expressions }}
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

const K8RolloutDeployInputStep: React.FC<K8RolloutDeployProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: inputSetData?.readonly
            }}
            disabled={inputSetData?.readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipDryRun`}
            label={getString('pipelineSteps.skipDryRun')}
            disabled={inputSetData?.readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}
export interface K8RolloutDeployVariableStepProps {
  initialValues: K8RolloutDeployData
  stageIdentifier: string
  onUpdate?(data: K8RolloutDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8RolloutDeployData
}

const K8RolloutDeployVariableStep: React.FC<K8RolloutDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      className={stepCss.topSpacingLarge}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const K8sRolloutDeployRef = React.forwardRef(K8RolloutDeployWidget)
export class K8RolloutDeployStep extends PipelineStep<K8RolloutDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<K8RolloutDeployData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8RolloutDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8RolloutDeployVariableStep
          {...(customStepProps as K8RolloutDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <K8sRolloutDeployRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8RolloutDeployData>): FormikErrors<K8RolloutDeployData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
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
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  protected type = StepType.K8sRollingDeploy
  protected stepName = 'K8s Rollout Deploy'
  protected stepIcon: IconName = 'rolling'
  protected isHarnessSpecific = true

  protected defaultValues: K8RolloutDeployData = {
    identifier: '',
    name: '',
    type: StepType.K8sRollingDeploy,
    timeout: '10m',
    spec: {
      skipDryRun: false
    }
  }
}

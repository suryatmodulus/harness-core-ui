import React from 'react'
import { IconName, Formik, FormInput, Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, K8sRollingRollbackStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import type { StringsMap } from 'stringTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface K8sRollingRollbackData extends StepElementConfig {
  spec: Omit<K8sRollingRollbackStepInfo, 'skipDryRun'> & { skipDryRun: boolean }
}

export interface K8RollingRollbackVariableStepProps {
  initialValues: K8sRollingRollbackData
  stageIdentifier: string
  onUpdate?(data: K8sRollingRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sRollingRollbackData
}

interface K8sRollingRollbackProps {
  initialValues: K8sRollingRollbackData
  onUpdate?: (data: K8sRollingRollbackData) => void
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: K8sRollingRollbackData
    path?: string
    readonly?: boolean
  }
}

function K8sRollingRollbackWidget(
  props: K8sRollingRollbackProps,
  formikRef: StepFormikFowardRef<K8sRollingRollbackData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sRollingRollbackData>
        onSubmit={(values: K8sRollingRollbackData) => {
          onUpdate?.({ ...values, spec: { skipDryRun: false } })
        }}
        formName="k8RollingRB"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          identifier: IdentifierSchema()
        })}
      >
        {(formik: FormikProps<K8sRollingRollbackData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: readonly }}
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
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const K8sRollingRollbackInputStep: React.FC<K8sRollingRollbackProps> = ({ inputSetData }) => {
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
            className={stepCss.checkbox}
            label={getString('pipelineSteps.skipDryRun')}
            disabled={inputSetData?.readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}

const K8RollingRollbackVariableStep: React.FC<K8RollingRollbackVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8sRollingRollbackWidgetWithRef = React.forwardRef(K8sRollingRollbackWidget)
export class K8sRollingRollbackStep extends PipelineStep<K8sRollingRollbackData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<K8sRollingRollbackData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sRollingRollbackInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8RollingRollbackVariableStep
          {...(customStepProps as K8RollingRollbackVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8sRollingRollbackWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sRollingRollbackData>): FormikErrors<K8sRollingRollbackData> {
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

  protected type = StepType.K8sRollingRollback
  protected stepName = 'K8s Rollout Rollback'
  protected stepIcon: IconName = 'undo'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.K8sRollingRollback'

  protected defaultValues: K8sRollingRollbackData = {
    identifier: '',
    name: '',
    type: StepType.K8sRollingRollback,
    timeout: '10m',
    spec: {
      skipDryRun: false
    }
  }
}

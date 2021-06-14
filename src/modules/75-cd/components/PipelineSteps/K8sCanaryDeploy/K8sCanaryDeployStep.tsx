import React from 'react'
import { IconName, Formik, FormInput, Layout, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { get, has, isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { K8sRollingStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { FormMultiTypeCheckboxField, FormInstanceDropdown } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sCanaryDeployData extends StepElementConfig {
  spec: Omit<K8sRollingStepInfo, 'skipDryRun'> & {
    skipDryRun?: boolean
  }
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
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sCanaryDeployData>
        onSubmit={(values: K8sCanaryDeployData) => {
          onUpdate?.(values)
        }}
        formName="k8CanaryDeploy"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            instanceSelection: getInstanceDropdownSchema()
          }),
          identifier: IdentifierSchema()
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
                  expressions={expressions}
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
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{ expressions, enableConfigureOptions: false, disabled: readonly }}
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
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.skipDryRun"
                  label={getString('pipelineSteps.skipDryRun')}
                  multiTypeTextbox={{ expressions, disabled: readonly }}
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
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            name={`${prefix}spec.skipDryRun`}
            label={getString('pipelineSteps.skipDryRun')}
            disabled={readonly}
          />
        </div>
      )}
      {(getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.count) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(template?.spec?.instanceSelection?.spec?.percentage) === MultiTypeInputType.RUNTIME) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('pipelineSteps.instanceLabel')}
            name={`${prefix}spec.instanceSelection`}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            disabledType
            disabled={readonly}
          />
        </div>
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
        onUpdate={values => onUpdate?.(this.processFormData(values))}
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

  processFormData(values: K8sCanaryDeployData): K8sCanaryDeployData {
    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Instances &&
      has(values, 'spec.instanceSelection.spec.percentage')
    ) {
      delete values.spec.instanceSelection.spec.percentage
    }

    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Percentage &&
      has(values, 'spec.instanceSelection.spec.count')
    ) {
      delete values.spec.instanceSelection.spec.count
    }

    return values
  }

  validateInputSet(
    data: K8sCanaryDeployData,
    template: K8sCanaryDeployData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<K8sCanaryDeployData> {
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

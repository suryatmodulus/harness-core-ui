import React from 'react'
import { IconName, Formik, Layout, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings, UseStringsReturn } from 'framework/exports'
import type { K8sRollingStepInfo, StepElementConfig } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sBGDeployData extends StepElementConfig {
  spec: K8sRollingStepInfo
}

interface K8BGDeployProps {
  initialValues: K8sBGDeployData
  onUpdate?: (data: K8sBGDeployData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: K8sBGDeployData
    path?: string
    readonly?: boolean
  }
}

function K8BGDeployWidget(props: K8BGDeployProps, formikRef: StepFormikFowardRef<K8sBGDeployData>): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sBGDeployData>
        onSubmit={(values: K8sBGDeployData) => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          ...IdentifierValidation()
        })}
      >
        {(formik: FormikProps<K8sBGDeployData>) => {
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
                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: false, expressions }}
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
                  <FormMultiTypeCheckboxField name="spec.skipDryRun" label={getString('pipelineSteps.skipDryRun')} />
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8BGDeployInputStep: React.FC<K8BGDeployProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={inputSetData?.readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipDryRun`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipDryRun')}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}

export interface K8BGVariableStepProps {
  initialValues: K8sBGDeployData
  stageIdentifier: string
  onUpdate?(data: K8sBGDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sBGDeployData
}

const K8BGVariableStep: React.FC<K8BGVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8BGDeployWidgetWidgetWithRef = React.forwardRef(K8BGDeployWidget)
export class K8sBlueGreenDeployStep extends PipelineStep<K8sBGDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  renderStep(props: StepProps<K8sBGDeployData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8BGDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8BGVariableStep
          {...(customStepProps as K8BGVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8BGDeployWidgetWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  validateInputSet(
    data: K8sBGDeployData,
    template: K8sBGDeployData,
    getString?: UseStringsReturn['getString']
  ): object {
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
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  protected type = StepType.K8sBlueGreenDeploy
  protected stepName = 'K8s Blue Green Deploy'
  protected stepIcon: IconName = 'bluegreen'
  protected isHarnessSpecific = true

  protected defaultValues: K8sBGDeployData = {
    identifier: '',
    timeout: '10m',
    spec: {
      skipDryRun: false
    }
  }
}

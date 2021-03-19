import React from 'react'
import { IconName, Formik, Layout, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikProps, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'

import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, K8sBGSwapServicesStepInfo } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings, UseStringsReturn } from 'framework/exports'

import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface K8sBGSwapServicesData extends StepElementConfig {
  spec: K8sBGSwapServicesStepInfo
}

interface K8sBGSwapProps {
  initialValues: K8sBGSwapServicesData
  onUpdate?: (data: K8sBGSwapServicesData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: K8sBGSwapServicesData
    path?: string
    readonly?: boolean
  }
}

export interface K8sBGSwapServicesVariablesStepProps {
  initialValues: K8sBGSwapServicesData
  stageIdentifier: string
  onUpdate?(data: K8sBGSwapServicesData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sBGSwapServicesData
}

function K8sBGSwapWidget(
  props: K8sBGSwapProps,
  formikRef: StepFormikFowardRef<K8sBGSwapServicesData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sBGSwapServicesData>
        onSubmit={(values: K8sBGSwapServicesData) => {
          /* istanbul ignore next */
          onUpdate?.({ ...values, spec: { skipDryRun: false } })
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
        {(formik: FormikProps<K8sBGSwapServicesData>) => {
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
                    className={stepCss.duration}
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
                        /* istanbul ignore next */
                        setFieldValue('timeout', value)
                      }}
                    />
                  )}
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8sBGSwapInputStep: React.FC<K8sBGSwapProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}.timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}

const K8sBGSwapServicesVariablesStep: React.FC<K8sBGSwapServicesVariablesStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8sBGSwapWidgetWithRef = React.forwardRef(K8sBGSwapWidget)
export class K8sBGSwapServices extends PipelineStep<K8sBGSwapServicesData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }
  renderStep(props: StepProps<K8sBGSwapServicesData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sBGSwapInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sBGSwapServicesVariablesStep
          {...(customStepProps as K8sBGSwapServicesVariablesStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8sBGSwapWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.K8sBGSwapServices
  protected stepName = 'K8s Blue Green Swap Services'

  protected stepIcon: IconName = 'command-swap'
  /* istanbul ignore next */

  validateInputSet(
    data: K8sBGSwapServicesData,
    template: K8sBGSwapServicesData,
    getString?: UseStringsReturn['getString']
  ): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
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
    return errors
  }

  protected defaultValues: K8sBGSwapServicesData = {
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      skipDryRun: false
    }
  }
}

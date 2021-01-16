import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  TextInput,
  Checkbox,
  Accordion
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { FormGroup } from '@blueprintjs/core'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { K8sRollingStepInfo, StepElement } from 'services/cd-ng'
import { FormMultiTypeCheckboxField, FormInstanceDropdown, InstanceDropdownField } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/exports'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import stepCss from '../Steps.module.scss'

export interface K8sCanaryDeployData extends StepElement {
  spec: K8sRollingStepInfo
  identifier: string
}

interface K8sCanaryDeployProps {
  initialValues: K8sCanaryDeployData
  onUpdate?: (data: K8sCanaryDeployData) => void
  stepViewType?: StepViewType
  template?: K8sCanaryDeployData
}

function K8CanaryDeployWidget(
  props: K8sCanaryDeployProps,
  formikRef: StepFormikFowardRef<K8sCanaryDeployData>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()

  return (
    <>
      <Formik<K8sCanaryDeployData>
        onSubmit={(values: K8sCanaryDeployData) => {
          const data = values
          data.spec.instanceSelection = {}
          if (values?.instanceType === InstanceTypes.Instances) {
            data.spec.instanceSelection = {
              type: InstanceTypes.Instances,
              spec: {
                count: values.instances
              }
            }
          } else if (values?.instanceType === InstanceTypes.Percentage) {
            data.spec.instanceSelection = {
              type: InstanceTypes.Percentage,
              spec: {
                percentage: values.instances
              }
            }
          }
          delete data.instanceType
          delete data.instances
          onUpdate?.(data)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),

          spec: Yup.string().required(getString('pipelineSteps.timeoutRequired')),
          instances: Yup.number()
            .min(0, getString('pipelineSteps.lessThanZero'))
            .max(100, getString('pipelineSteps.morethanHundred'))
            .required(getString('pipelineSteps.instancesRequired'))
        })}
      >
        {(formik: FormikProps<K8sCanaryDeployData>) => {
          const { submitForm, values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Accordion activeId="details" collapseProps={{ transitionDuration: 0 }}>
                <Accordion.Panel
                  id="details"
                  summary={getString('pipelineSteps.k8sCanaryDeploy')}
                  details={
                    <>
                      <div className={stepCss.formGroup}>
                        <FormInput.InputWithIdentifier inputLabel={getString('name')} />
                      </div>
                      <div className={stepCss.formGroup}>
                        <FormInstanceDropdown
                          typeName={getString('pipelineSteps.typeName')}
                          name={getString('instanceFieldOptions.instances')}
                          label={getString('pipelineSteps.instanceLabel')}
                        />
                        {getMultiTypeFromValue(values.instances) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={values.instances as string}
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

                      <div className={stepCss.formGroup}>
                        <FormMultiTypeDurationField
                          name="spec.timeout"
                          label={getString('pipelineSteps.timeoutLabel')}
                          className={stepCss.duration}
                          multiTypeDurationProps={{ enableConfigureOptions: false }}
                        />
                        {getMultiTypeFromValue(values.spec.timeout) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={values.spec.timeout as string}
                            type="String"
                            variableName="step.spec.timeout"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => {
                              setFieldValue('spec.timeout', value)
                            }}
                          />
                        )}
                      </div>
                      <div className={stepCss.formGroup}>
                        <FormMultiTypeCheckboxField
                          name="spec.skipDryRun"
                          label={getString('pipelineSteps.skipDryRun')}
                        />
                      </div>
                    </>
                  }
                />
              </Accordion>
              <div className={stepCss.actionsPanel}>
                <Button intent="primary" text={getString('submit')} onClick={submitForm} />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8CanaryDeployInputStep: React.FC<K8sCanaryDeployProps> = ({ onUpdate, initialValues, template }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(template?.spec?.timeout) === MultiTypeInputType.RUNTIME && (
        <FormGroup label={getString('pipelineSteps.timeoutLabel')}>
          <TextInput
            name="spec.timeout"
            onChange={(event: React.SyntheticEvent<HTMLInputElement>) => {
              onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, timeout: event.currentTarget.value } })
            }}
          />
        </FormGroup>
      )}
      {getMultiTypeFromValue(template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <FormGroup>
          <Checkbox
            name="spec.skipDryRun"
            className={stepCss.checkbox}
            label={getString('pipelineSteps.skipDryRun')}
            onChange={event => {
              onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, skipDryRun: event.currentTarget.checked } })
            }}
          />
        </FormGroup>
      )}
      {getMultiTypeFromValue(template?.instances) === MultiTypeInputType.RUNTIME && (
        <FormGroup label={getString('pipelineSteps.instanceLabel')}>
          <InstanceDropdownField
            value={template?.instances}
            name={getString('instanceFieldOptions.instances')}
            label={getString('pipelineSteps.instanceLabel')}
          />
        </FormGroup>
      )}
    </>
  )
}
const K8CanaryDeployWidgetWithRef = React.forwardRef(K8CanaryDeployWidget)
export class K8sCanaryDeployStep extends PipelineStep<K8sCanaryDeployData> {
  renderStep(props: StepProps<K8sCanaryDeployData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef } = props

    const data = initialValues
    if (initialValues.spec.instanceSelection) {
      data.instanceType = initialValues.spec.instanceSelection.type
      data.instances =
        initialValues.spec.instanceSelection.type === InstanceTypes.Instances
          ? initialValues.spec.instanceSelection.spec.count
          : initialValues.spec.instanceSelection.spec.percentage
      delete data.spec.instanceSelection
    }

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8CanaryDeployInputStep
          initialValues={data}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
        />
      )
    }
    return (
      <K8CanaryDeployWidgetWithRef
        initialValues={data}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.K8sCanaryDeploy
  protected stepName = 'K8s Canary Deploy'

  protected stepIcon: IconName = 'service-kubernetes'
  /* istanbul ignore next */
  validateInputSet(): object {
    /* istanbul ignore next */
    return {}
  }
  protected defaultValues: K8sCanaryDeployData = {
    identifier: '',
    spec: {
      skipDryRun: false,
      timeout: '10m'
    },
    instances: '',
    instanceType: InstanceTypes.Instances
  }
}

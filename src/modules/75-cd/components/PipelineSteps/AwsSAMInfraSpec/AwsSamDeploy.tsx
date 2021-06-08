import React from 'react'
import { IconName, Formik, FormInput, Layout } from '@wings-software/uicore'
// import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
// import { get, has, isEmpty } from 'lodash-es'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
// import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { K8sRollingStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
// import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
// import { FormMultiTypeCheckboxField, FormInstanceDropdown } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
// import {
//   FormMultiTypeDurationField,
//   getDurationValidationSchema
// } from '@common/components/MultiTypeDuration/MultiTypeDuration'
// import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
//
// import { useStrings } from 'framework/strings'
// import type { UseStringsReturn } from 'framework/strings'
// import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
// import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
// import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import AwsSamOverrides from './AwsSamOverrides'

export interface AwsSamDeployData extends StepElementConfig {
  spec: Omit<K8sRollingStepInfo, 'skipDryRun'> & {
    skipDryRun?: boolean
    overrides?: any[]
  }
  identifier: string
}

export interface K8sCanaryDeployVariableStepProps {
  initialValues: AwsSamDeployData
  stageIdentifier: string
  onUpdate?(data: AwsSamDeployData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsSamDeployData
}

// @ts-ignore
export class AwsSamDeploy extends PipelineStep<AwsSamDeployData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AwsSamDeployData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      // stepViewType,
      // inputSetData,
      formikRef,
      // customStepProps,
      isNewStep,
      readonly
    } = props
    return (
      <>
        <Formik<AwsSamDeployData>
          onSubmit={(values: AwsSamDeployData) => {
            onUpdate?.(values)
          }}
          formName="AwsSamDeploy"
          initialValues={initialValues}
        >
          {(formik: FormikProps<AwsSamDeployData>) => {
            // const { values, setFieldValue } = formik
            // @ts-ignore
            setFormikRef(formikRef, formik)
            return (
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel="Name"
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{ disabled: readonly }}
                  />
                </div>
                <FormInput.Text name="spec.region" label="Region" placeholder="Enter Region" />
                <FormInput.Text name="spec.stackName" label="Stack Name" placeholder="Stack Name" />
                <AwsSamOverrides formik={formik} />
                <FormInput.Text
                  name="spec.globalAdditionalFlags"
                  label="Global Additional Flags"
                  placeholder="Enter Global Additional flags"
                />
              </Layout.Vertical>
            )
          }}
        </Formik>
      </>
    )
  }

  protected type = StepType.AwsSamDeploy
  protected stepName = 'Aws SAM Deploy'

  protected stepIcon: IconName = 'app-aws-lambda'
  protected isHarnessSpecific = true

  processFormData(values: AwsSamDeployData): AwsSamDeployData {
    // @ts-ignore
    delete values.spec?.skipDryRun
    // @ts-ignore
    delete values.spec?.instanceSelection
    return {
      ...values,
      spec: {
        ...values.spec,
        overrides: Array.isArray(values.spec?.overrides)
          ? values.spec?.overrides.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : undefined
      }
    }
  }

  protected defaultValues: AwsSamDeployData = {
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

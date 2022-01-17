/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Layout } from '@wings-software/uicore'

import cx from 'classnames'
import { connect } from 'formik'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'

import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'

import type { AllNGVariables } from '@pipeline/utils/types'

import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'
import { ArtifactInputForm } from '@cd/components/ArtifactInputForm/ArtifactInputForm'

import type { KubernetesServiceInputFormProps } from '../K8sServiceSpecInterface'

import css from '../K8sServiceSpec.module.scss'

const KubernetesServiceSpecInputFormikForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  factory,
  allValues,
  initialValues,
  onUpdate,
  readonly = false,
  stageIdentifier,
  formik,
  allowableTypes
}) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium">
      {!!template?.artifacts && (
        <ArtifactInputForm
          template={template}
          path={path}
          allValues={allValues}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )}
      {!!template?.manifests?.length && (
        <ManifestInputForm
          template={template}
          path={path}
          allValues={allValues}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )}
      {!!template?.variables?.length && (
        <div id={`Stage.${stageIdentifier}.Service.Variables`} className={cx(css.nopadLeft, css.accordionSummary)}>
          <div className={css.subheading}>{getString('variablesText')}</div>

          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              allowableTypes={allowableTypes}
              onUpdate={({ variables }: CustomVariablesData) => {
                onUpdate?.({
                  variables: variables as any
                })
              }}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      )}
    </Layout.Vertical>
  )
}
export const KubernetesServiceSpecInputForm = connect(KubernetesServiceSpecInputFormikForm)

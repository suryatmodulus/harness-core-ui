import React from 'react'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
// import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'

import type { K8SDirectServiceStep } from './K8sServiceSpecInterface'
import { KubernetesArtifacts } from './KubernetesArtifacts'
import { KubernetesManifests } from './KubernetesManifests/KubernetesManifests'
import { KubernetesSidecars } from './KubernetesSidecars'
import css from './K8sServiceSpec.module.scss'

export interface KubernetesInputSetProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
}

export const KubernetesServiceSpecInputSetMode = (props: KubernetesInputSetProps) => {
  const {
    template,
    path,
    factory,
    allValues,
    initialValues,
    onUpdate,
    readonly = false,
    stageIdentifier,
    stepViewType,
    formik
  } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium">
      <KubernetesArtifacts
        template={template}
        type={allValues?.artifacts?.primary?.type || ''}
        artifactSourceBaseFactory={artifactSourceBaseFactory}
        stepViewType={stepViewType}
        stageIdentifier={stageIdentifier}
        artifacts={allValues?.artifacts}
        formik={formik}
        path={path}
        initialValues={initialValues}
        readonly={readonly}
      />
      <KubernetesSidecars />

      {!!template?.manifests?.length && (
        <KubernetesManifests
          template={template}
          path={path}
          stepViewType={stepViewType}
          manifests={allValues?.manifests}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )}
      {/* {!!template?.manifests?.length && (
        <ManifestInputForm
          template={template}
          path={path}
          allValues={allValues}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )} */}
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

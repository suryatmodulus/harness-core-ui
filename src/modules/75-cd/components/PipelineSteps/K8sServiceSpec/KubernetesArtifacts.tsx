import React from 'react'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import artifactSourceBaseFactory, {
  ArtifactSourceBaseFactory
} from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import type { K8SDirectServiceStep } from './K8sServiceSpecInterface'

export interface KubernetesArtifactsProps {
  type: string
  template?: ServiceSpec
  stepViewType?: StepViewType
  artifactSourceBaseFactory: ArtifactSourceBaseFactory
  stageIdentifier: string
  artifacts?: ArtifactListConfig
  formik?: any
  path?: string
  initialValues: K8SDirectServiceStep
  readonly: boolean
  expressions?: string[]
}

export function KubernetesArtifacts(props: KubernetesArtifactsProps) {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = props.stepViewType === StepViewType.InputSet || props.stepViewType === StepViewType.DeploymentForm
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)
  const artifactSource = artifactSourceBaseFactory.getArtifactSource(props.type)
  return artifactSource ? (
    <>
      {artifactSource.renderContent({
        ...props,
        isArtifactsRuntime,
        isPrimaryArtifactsRuntime,
        isSidecarRuntime,
        getString,
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier,
        repoIdentifier,
        branch
      })}
    </>
  ) : null
}

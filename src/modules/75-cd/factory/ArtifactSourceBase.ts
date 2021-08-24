import type { StringsMap } from 'stringTypes'
import type { KubernetesArtifactsProps } from '@cd/components/PipelineSteps/K8sServiceSpec/KubernetesArtifacts'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface ArtifactSourceRenderProps extends KubernetesArtifactsProps {
  isArtifactsRuntime: boolean
  isPrimaryArtifactsRuntime: boolean
  isSidecarRuntime: boolean
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
}

export enum AsyncStatus {
  INIT = 'INIT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INPROGRESS = 'INPROGRESS'
}

export abstract class ArtifactSourceBase<T> {
  protected abstract artifactType: string
  protected abstract isSidecar: boolean
  protected abstract tagsList: SelectOption[]
  protected abstract fetchTagsError: string
  protected abstract tagsApiStatus: AsyncStatus
  abstract isTagsSelectionDisabled(params: T): boolean
  abstract renderContent(props: ArtifactSourceRenderProps): JSX.Element | null
  abstract fetchTags(props: unknown): void

  getArtifactSourceType() {
    return this.artifactType
  }
}

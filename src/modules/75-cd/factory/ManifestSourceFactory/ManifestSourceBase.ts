import type { StringsMap } from 'stringTypes'
import type { KubernetesServiceInputFormProps } from '@pipeline/factories/ArtifactTriggerInputFactory/types'

export interface ManifestSourceRenderProps extends KubernetesServiceInputFormProps {
  isManifestsRuntime: boolean
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
}

export abstract class ManifestSourceBase<T> {
  protected abstract manifestType: string
  abstract isFieldDisabled(params: T): boolean
  abstract renderContent(props: ManifestSourceRenderProps): JSX.Element | null

  getManifestSourceType() {
    return this.manifestType
  }
}

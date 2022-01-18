/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import type { KubernetesArtifactsProps } from '@cd/components/PipelineSteps/K8sServiceSpec/KubernetesArtifacts'

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

export abstract class ArtifactSourceBase<T> {
  protected abstract artifactType: string
  protected abstract isSidecar: boolean
  abstract isTagsSelectionDisabled(params: T): boolean
  abstract renderContent(props: ArtifactSourceRenderProps): JSX.Element | null

  getArtifactSourceType() {
    return this.artifactType
  }
}

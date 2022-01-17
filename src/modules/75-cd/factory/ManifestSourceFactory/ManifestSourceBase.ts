/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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

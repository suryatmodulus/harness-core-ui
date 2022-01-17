/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'

export class K8sManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = 'K8sManifest'

  isFieldDisabled(): boolean {
    return false
  }

  renderContent(): JSX.Element | null {
    return null
  }
}

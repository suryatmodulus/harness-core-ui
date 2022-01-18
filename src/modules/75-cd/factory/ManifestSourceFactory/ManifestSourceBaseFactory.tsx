/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { K8sManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/K8sManifestSource'
import type { ManifestSourceBase } from './ManifestSourceBase'

export class ManifestSourceBaseFactory {
  protected manifestSourceDict: Map<string, ManifestSourceBase<unknown>>

  constructor() {
    this.manifestSourceDict = new Map()
  }

  getManifestSource<T>(manifestSourceType: string): ManifestSourceBase<T> | undefined {
    if (manifestSourceType) {
      return this.manifestSourceDict.get(manifestSourceType) as ManifestSourceBase<T>
    }
  }

  registerManifestSource<T>(manifestSource: ManifestSourceBase<T>): void {
    this.manifestSourceDict.set(manifestSource.getManifestSourceType(), manifestSource)
  }

  deRegisterManifestSource(manifestSourceType: string): void {
    this.manifestSourceDict.delete(manifestSourceType)
  }
}

const manifestSourceBaseFactory = new ManifestSourceBaseFactory()
manifestSourceBaseFactory.registerManifestSource(new K8sManifestSource())

export default manifestSourceBaseFactory

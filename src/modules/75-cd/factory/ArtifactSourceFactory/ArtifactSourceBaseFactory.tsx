/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DockerArtifactSource } from '@cd/components/PipelineSteps/K8sServiceSpec/DockerArtifactSource'
import { ECRArtifactSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ECRArtifactSource'
import { GCRArtifactSource } from '@cd/components/PipelineSteps/K8sServiceSpec/GCRArtifactSource'
import type { ArtifactSourceBase } from './ArtifactSourceBase'

export class ArtifactSourceBaseFactory {
  protected artifactSourceDict: Map<string, ArtifactSourceBase<unknown>>

  constructor() {
    this.artifactSourceDict = new Map()
  }

  getArtifactSource<T>(artifactSourceType: string): ArtifactSourceBase<T> | undefined {
    if (artifactSourceType) {
      return this.artifactSourceDict.get(artifactSourceType) as ArtifactSourceBase<T>
    }
  }

  registerArtifactSource<T>(artifactSource: ArtifactSourceBase<T>): void {
    this.artifactSourceDict.set(artifactSource.getArtifactSourceType(), artifactSource)
  }

  deRegisterArtifactSource(artifactSourceType: string): void {
    this.artifactSourceDict.delete(artifactSourceType)
  }
}

const artifactSourceBaseFactory = new ArtifactSourceBaseFactory()
artifactSourceBaseFactory.registerArtifactSource(new DockerArtifactSource())
artifactSourceBaseFactory.registerArtifactSource(new GCRArtifactSource())
artifactSourceBaseFactory.registerArtifactSource(new ECRArtifactSource())
export default artifactSourceBaseFactory

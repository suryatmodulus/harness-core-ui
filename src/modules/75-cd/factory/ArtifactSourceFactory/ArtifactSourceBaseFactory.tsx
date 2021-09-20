import { DockerArtifactSource } from '@cd/components/PipelineSteps/K8sServiceSpec/DockerArtifactSource'
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
export default artifactSourceBaseFactory

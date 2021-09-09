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

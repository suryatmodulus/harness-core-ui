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

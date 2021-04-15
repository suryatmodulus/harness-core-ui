import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/exports'
import type { HelmVersionOptions, ManifestStores, ManifestTypes } from './ManifestInterface'

export const ManifestDataType: { [key: string]: ManifestTypes } = {
  K8sManifest: 'K8sManifest',
  Values: 'Values',
  HelmChart: 'HelmChart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'OpenshiftTemplate',
  OpenshiftParam: 'OpenshiftParam'
}

export const ManifestStoreMap: { [key: string]: ManifestStores } = {
  Git: 'Git',
  Github: 'Github',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  Http: 'Http',
  S3: 'S3',
  Gcs: 'Gcs'
}

export const manifestTypeIcons: Record<ManifestTypes, IconName> = {
  K8sManifest: 'service-kubernetes',
  Values: 'functions',
  HelmChart: 'service-helm',
  Kustomize: 'kustamize',
  OpenshiftTemplate: 'openshift',
  OpenshiftParam: 'openshift-params'
}

export const manifestTypeLabels: Record<ManifestTypes, string> = {
  K8sManifest: 'K8s Manifest',
  Values: 'Values YAML',
  HelmChart: 'Helm Chart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'Openshift Template',
  OpenshiftParam: 'Openshift Param'
}

export const manifestTypeText: Record<string, string> = {
  K8sManifest: 'Manifest',
  Values: 'Values Overrides',
  HelmChart: 'Helm Chart',
  Kustomize: 'Kustomize',
  OpenshiftTemplate: 'Openshift Template',
  OpenshiftParam: 'Openshift Param'
}

export const helmVersions: Array<{ label: string; value: HelmVersionOptions }> = [
  { label: 'Version 2', value: 'V2' },
  { label: 'Version 3', value: 'V3' }
]
export const getManifestIconByType = (type: string | undefined): IconName => {
  switch (type) {
    case ManifestStoreMap.Git:
      return 'service-github'
    case ManifestStoreMap.Github:
      return 'github'
    case ManifestStoreMap.GitLab:
      return 'service-gotlab'
    case ManifestStoreMap.Bitbucket:
      return 'bitbucket'
    case ManifestStoreMap.Http:
      return 'service-helm'
    case ManifestStoreMap.S3:
      return 'service-service-s3'
    case ManifestStoreMap.Gcs:
      return 'gcs-step'
    default:
      return 'cog'
  }
}
export const getManifestStoreTitle = (type: string): StringKeys => {
  switch (type) {
    case ManifestStoreMap.Git:
      return 'pipeline.manifestType.gitConnectorLabel'
    case ManifestStoreMap.Github:
      return 'common.repo_provider.githubLabel'
    case ManifestStoreMap.GitLab:
      return 'common.repo_provider.gitlabLabel'
    case ManifestStoreMap.Bitbucket:
      return 'pipeline.manifestType.bitBucketLabel'
    case ManifestStoreMap.Http:
      return 'pipeline.manifestType.httpHelmRepoConnectorLabel'
    case ManifestStoreMap.S3:
      return 'connectors.S3'
    case ManifestStoreMap.Gcs:
      return 'connectors.GCS.fullName'
    default:
      return 'store'
  }
}

export const ManifestToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Http: Connectors.HttpHelmRepo,
  S3: Connectors.AWS,
  Gcs: Connectors.GCP
}
export const GitRepoName: Record<string, string> = {
  Account: 'Account',
  Repo: 'Repo'
}

export const gitFetchTypes = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit ID', value: 'Commit' }
]

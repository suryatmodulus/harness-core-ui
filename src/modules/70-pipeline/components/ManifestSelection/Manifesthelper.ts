import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
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

export const helmVersions: Array<{ label: string; value: HelmVersionOptions }> = [
  { label: 'Version 2', value: 'V2' },
  { label: 'Version 3', value: 'V3' }
]

export const ManifestIconByType: Record<ManifestStores, IconName> = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Http: 'service-helm',
  S3: 'service-service-s3',
  Gcs: 'gcs-step'
}

export const ManifestStoreTitle: Record<ManifestStores, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Http: 'pipeline.manifestType.httpHelmRepoConnectorLabel',
  S3: 'connectors.S3',
  Gcs: 'connectors.GCS.fullName'
}

export const ManifestToConnectorMap: Record<ManifestStores | string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Http: Connectors.HttpHelmRepo,
  S3: Connectors.AWS,
  Gcs: Connectors.GCP
}

export const ManifestToConnectorLabelMap: Record<ManifestStores | string, string> = {
  Git: 'Git',
  Github: 'GitHub',
  GitLab: 'GitLab',
  Bitbucket: 'Bitbucket',
  Http: 'HttpHelmRepo',
  S3: 'AWS',
  Gcs: 'GCP'
}

export enum GitRepoName {
  Account = 'Account',
  Repo = 'Repo'
}

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit ID', value: 'Commit' }
]

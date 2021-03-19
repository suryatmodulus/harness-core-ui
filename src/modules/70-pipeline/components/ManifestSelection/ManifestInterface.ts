import type { ConnectorInfoDTO, ManifestConfig, ManifestConfigWrapper, PageConnectorResponse } from 'services/cd-ng'
import type { StageElementWrapper, NgPipeline } from 'services/cd-ng'

export type ManifestTypes =
  | 'K8sManifest'
  | 'Values'
  | 'HelmChart'
  | 'Kustomize'
  | 'OpenshiftTemplate'
  | 'OpenshiftParam'

export type ManifestStores = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Http' | 'S3' | 'Gcs'
export type HelmVersionOptions = 'V2' | 'V3'
export interface ManifestSelectionProps {
  isForOverrideSets?: boolean
  identifierName?: string
  isForPredefinedSets?: boolean
  isPropagating?: boolean
  overrideSetIdentifier?: string
}

export interface ManifestListViewProps {
  pipeline: NgPipeline
  isForOverrideSets: boolean
  updatePipeline: (pipeline: NgPipeline) => Promise<void>
  identifierName?: string
  stage: StageElementWrapper | undefined
  isForPredefinedSets: boolean
  isPropagating?: boolean
  overrideSetIdentifier?: string
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
}

export interface ManifestStepInitData {
  connectorRef: string | undefined
  store: ConnectorInfoDTO['type'] | string
}
export interface ManifestDetailDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: any
  skipResourceVersioning?: boolean
  repoName?: string
}
export interface ManifestLastStepProps {
  key: string
  name: string
  expressions: string[]
  stepName: string
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  selectedManifest: string
}
export interface CommandFlags {
  commandType: string | undefined
  flag: string | undefined
  id?: string
}
export interface HelmWithGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  folderPath: string
  helmVersion: string
  skipResourceVersioning: boolean
  commandFlags: Array<CommandFlags>
}
export interface HelmWithHTTPDataType {
  identifier: string
  helmVersion: string
  skipResourceVersioning: boolean
  chartName: string
  chartVersion: string
  commandFlags: Array<CommandFlags>
}

export interface HelmWithGcsDataType {
  identifier: string
  helmVersion: string
  skipResourceVersioning: boolean
  chartName: string
  chartVersion: string
  commandFlags: Array<CommandFlags>
  bucketName: string
  folderPath: string
}
export interface HelmWithS3DataType extends HelmWithHTTPDataType {
  folderPath: string
  region: any
  bucketName: string
}

export interface OpenShiftTemplateGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  path: string
  skipResourceVersioning: boolean
}
export interface KustomizeWithGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  skipResourceVersioning: boolean
  folderPath: string
  pluginPath: string
}
export interface OpenShiftParamDataType {
  identifier: string
  branch?: string | undefined
  commitId?: string | undefined
  repoName?: string
  gitFetchType?: 'Branch' | 'Commit'
  path: string
}

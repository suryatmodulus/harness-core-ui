import type { SelectOption } from '@wings-software/uicore'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type {
  ManifestConfig,
  ManifestConfigWrapper,
  PageConnectorResponse,
  PipelineInfoConfig,
  StageElementConfig
} from 'services/cd-ng'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

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
  pipeline: PipelineInfoConfig
  isForOverrideSets: boolean
  updateStage: (stage: StageElementConfig) => Promise<void>
  identifierName?: string
  stage: StageElementWrapper | undefined
  isForPredefinedSets: boolean
  isPropagating?: boolean
  overrideSetIdentifier?: string
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
  listOfManifests: Array<any>
  isReadonly: boolean
}

export interface ManifestStepInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ManifestStores | string
  selectedManifest: ManifestTypes | null
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
  selectedManifest: ManifestTypes | null
  manifestIdsList: Array<string>
  isReadonly?: boolean
}
export interface CommandFlags {
  commandType: string | SelectOption | undefined
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
  region: SelectOption | string
  bucketName: SelectOption | string
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
  paths: string[] | any
}

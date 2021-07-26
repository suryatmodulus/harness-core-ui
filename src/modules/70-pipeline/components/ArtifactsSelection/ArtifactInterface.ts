import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { ArtifactConfig, PrimaryArtifact, PageConnectorResponse, SidecarArtifactWrapper } from 'services/cd-ng'

export interface ArtifactListViewProps {
  isForPredefinedSets?: boolean
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined
  overrideSetIdentifier?: string
  primaryArtifact: PrimaryArtifact
  sideCarArtifact: SidecarArtifactWrapper[] | undefined
  addNewArtifact: (view: number) => void
  editArtifact: (view: number, type: ArtifactType, index?: number) => void
  removePrimary: () => void
  removeSidecar: (index: number) => void
  fetchedConnectorResponse: PageConnectorResponse | undefined
  accountId: string
  refetchConnectors: () => void
  isReadonly: boolean
}
export interface ArtifactsSelectionProps {
  isForOverrideSets?: boolean
  isForPredefinedSets?: boolean
  identifierName?: string
  isPropagating?: boolean
  overrideSetIdentifier?: string
}

export type ArtifactType = 'DockerRegistry' | 'Gcr' | 'Ecr'
export interface OrganizationCreationType {
  type: ArtifactType
}
export enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}
export interface InitialArtifactDataType {
  submittedArtifact?: ArtifactType | null
  connectorId: string | undefined | ConnectorSelectedValue
}
export interface ImagePathTypes {
  identifier: string
  imagePath: string
  tag: any
  tagRegex: any
  tagType: TagTypes
  registryHostname?: string
  region?: any
}

export interface ImagePathProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: ImagePathTypes
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
}

export interface ConnectorRefLabelType {
  firstStepName: string
  secondStepName: string
}

import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type {
  ArtifactConfig,
  ArtifactSpecWrapper,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  StageElementWrapper
} from 'services/cd-ng'

export interface ArtifactListViewProps {
  isForPredefinedSets?: boolean
  stage: StageElementWrapper | undefined
  overrideSetIdentifier?: string
  primaryArtifact: ArtifactSpecWrapper
  sideCarArtifact: SidecarArtifactWrapper[]
  addNewArtifact: (view: number) => void
  editArtifact: (view: number, type: CreationType, index?: number) => void
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

export type CreationType = 'Dockerhub' | 'Gcr' | 'Ecr'
export interface OrganizationCreationType {
  type: CreationType
}
export enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}
export interface ConnectorDataType {
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
}

export interface ConnectorRefLabelType {
  firstStepName: string
  secondStepName: string
}

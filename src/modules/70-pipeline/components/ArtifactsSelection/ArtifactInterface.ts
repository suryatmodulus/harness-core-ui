import type { ArtifactConfig } from 'services/cd-ng'
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
  connectorId: string | undefined
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
  newConnector: string
}

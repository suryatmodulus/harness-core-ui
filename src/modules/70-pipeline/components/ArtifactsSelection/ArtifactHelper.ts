import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/exports'

export type CreationType = 'Dockerhub' | 'Gcr' | 'Ecr'

export const getArtifactIconByType = (type: string): IconName => {
  switch (type) {
    case Connectors.DOCKER:
    case 'Dockerhub':
      return 'service-dockerhub'
    case Connectors.AWS:
    case 'Ecr':
      return 'ecr-step'
    case Connectors.GCP:
    case 'Gcr':
      return 'service-gcp'
    default:
      return 'placeholder'
  }
}

export const getArtifactTitleIdByType = (type: string): StringKeys => {
  switch (type) {
    case Connectors.DOCKER:
      return 'dockerRegistry'
    case Connectors.AWS:
      return 'connectors.ECR.name'
    case Connectors.GCP:
      return 'connectors.GCR.name'
    default:
      return 'connector'
  }
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: CreationType } = {
  DockerRegistry: 'Dockerhub',
  Gcp: 'Gcr',
  Aws: 'Ecr'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Dockerhub: Connectors.DOCKER,
  Ecr: Connectors.AWS,
  Gcr: Connectors.GCP
}

export const tagOptions: IOptionProps[] = [
  {
    label: 'Value',
    value: 'value'
  },
  {
    label: 'Regex',
    value: 'regex'
  }
]

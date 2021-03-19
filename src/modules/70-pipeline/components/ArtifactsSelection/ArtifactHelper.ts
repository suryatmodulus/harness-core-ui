import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { Connectors } from '@connectors/constants'

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

export const getArtifactTitleIdByType = (type: string): string => {
  switch (type) {
    case Connectors.DOCKER:
      return 'dockerRegistry'
    case Connectors.AWS:
      return 'connectors.ECR.fullName'
    case Connectors.GCP:
      return 'connectors.GCR.fullName'
    default:
      return 'connector'
  }
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

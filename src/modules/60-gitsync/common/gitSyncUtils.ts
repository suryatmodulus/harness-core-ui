import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { GitSyncConfig, ConnectorInfoDTO } from 'services/cd-ng'

export const getGitConnectorIcon = (type: GitSyncConfig['gitConnectorType']): IconName => {
  switch (type) {
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    default:
      return 'cog'
  }
}

export interface ConnectorCardInterface {
  type: ConnectorInfoDTO['type']
  icon: {
    default: IconName
    selected: IconName
  }
}

export const gitCards: Array<ConnectorCardInterface> = [
  {
    type: Connectors.GITHUB,
    icon: {
      default: 'github-unselected',
      selected: 'github-selected'
    }
  },
  {
    type: Connectors.GITLAB,
    icon: {
      default: 'gitlab-unselected',
      selected: 'gitlab-selected'
    }
  },
  {
    type: Connectors.BITBUCKET,
    icon: {
      default: 'bitbucket-unselected',
      selected: 'bitbucket-selected'
    }
  }
]

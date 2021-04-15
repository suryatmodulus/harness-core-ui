import React from 'react'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { permission as permissionType } from './AWSCOConnector/constants'
import AWSCOConnector from './AWSCOConnector/AWSCOConnector'

interface CreateConnectorWizardProps {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  type: ConnectorInfoDTO['type']
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO | void
  hideLightModal: () => void
  onSuccess: (data?: ConnectorInfoDTO) => void | Promise<void>
  permission?: permissionType
}

export const ConnectorWizard: React.FC<CreateConnectorWizardProps> = props => {
  const { type, accountId, orgIdentifier, projectIdentifier, permission } = props
  switch (type) {
    case Connectors.CEAWS:
      return (
        <AWSCOConnector
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          onSuccess={props.onSuccess}
          permission={permission}
        />
      )
    default:
      return null
  }
}

export const CreateConnectorWizard: React.FC<CreateConnectorWizardProps> = props => {
  return (
    <div>
      <ConnectorWizard {...props} />
    </div>
  )
}

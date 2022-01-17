/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  return <ConnectorWizard {...props} />
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { AccessPoint } from 'services/lw'
import LoadBalancerDnsConfig from '../COGatewayAccess/LoadBalancerDnsConfig'
import COAPProviderSelector from '../COProviderSelector/COAPProviderSelector'
import AzureAPConfig from './AzureAPConfig'

interface CreateAccessPointDialogScreensProps {
  onSave: (lb: AccessPoint) => void
  onCancel: () => void
}

enum CloudProvider {
  AWS = 'aws',
  AZURE = 'azure'
}

const CreateAccessPointDialogScreens: React.FC<CreateAccessPointDialogScreensProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [connectorIdentifier, setConnectorIdentifier] = useState<string>()

  const showProviderSelectorScreen = !selectedProvider || !connectorIdentifier

  const handleCloudProviderSubmission = (cloudData: { connectorDetails?: string; provider: string }) => {
    setConnectorIdentifier(cloudData.connectorDetails)
    setSelectedProvider(cloudData.provider)
  }

  const initialLoadBalancer = {
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    org_id: orgIdentifier, // eslint-disable-line
    metadata: {
      security_groups: [] // eslint-disable-line
    },
    type: selectedProvider
  }
  return (
    <div>
      {showProviderSelectorScreen ? (
        <COAPProviderSelector onSubmit={handleCloudProviderSubmission} accountId={accountId} />
      ) : selectedProvider === CloudProvider.AWS ? (
        <LoadBalancerDnsConfig
          loadBalancer={initialLoadBalancer}
          cloudAccountId={connectorIdentifier}
          onClose={props.onCancel}
          mode={'create'}
          onSave={props.onSave}
        />
      ) : (
        <AzureAPConfig
          cloudAccountId={connectorIdentifier}
          onSave={props.onSave}
          mode={'create'}
          onClose={props.onCancel}
          loadBalancer={initialLoadBalancer}
        />
      )}
    </div>
  )
}

export default CreateAccessPointDialogScreens

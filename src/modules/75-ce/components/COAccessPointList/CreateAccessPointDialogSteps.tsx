import React, { useState } from 'react'
import { useParams } from 'react-router'
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
          createMode={true}
          onSave={props.onSave}
        />
      ) : (
        <AzureAPConfig
          cloudAccountId={connectorIdentifier}
          onSave={props.onSave}
          createMode={true}
          onClose={props.onCancel}
          loadBalancer={initialLoadBalancer}
        />
      )}
    </div>
  )
}

export default CreateAccessPointDialogScreens

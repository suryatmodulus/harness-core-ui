import React, { useState } from 'react'
import { Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import createConnectorModal from '@ce/components/Connectors/createConnectorModal'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
interface COGatewayBasicsProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  setCloudAccount: (s: string) => void
}

const COGatewayBasics: React.FC<COGatewayBasicsProps> = props => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { openConnectorModal } = createConnectorModal({
    onSuccess: (data: ConnectorInfoDTO | undefined) => {
      handleConnectorSelection(data as ConnectorInfoDTO)
    }
    // onClose: () => {
    // }
  })
  const { getString } = useStrings()

  const [selectedConnector, setSelectedConnector] = useState<ConnectorInfoDTO | null>(null)

  const handleConnectorSelection = (data: ConnectorInfoDTO) => {
    setSelectedConnector(data)
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.cloudAccount = { id: data.identifier?.toString(), name: data.name }
    updatedGatewayDetails.metadata.cloud_provider_details = { name: data.name }
    props.setGatewayDetails(updatedGatewayDetails)
    props.setCloudAccount(updatedGatewayDetails.cloudAccount.id)
  }

  return (
    <div>
      <Layout.Vertical spacing="large">
        <ConnectorReferenceField
          name="cloudAccount"
          category={'CLOUD_COST'}
          selected={props.gatewayDetails.cloudAccount.id || selectedConnector?.identifier}
          label={[
            getString('ce.co.gatewayBasics.connect'),
            props.gatewayDetails.provider.name,
            getString('ce.co.gatewayBasics.account')
          ].join(' ')}
          placeholder={getString('ce.co.gatewayBasics.select')}
          accountIdentifier={accountId}
          onChange={handleConnectorSelection}
        />
      </Layout.Vertical>
      <span
        onClick={() => openConnectorModal(false, 'CEAws')}
        style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
      >
        {[
          '+',
          getString('ce.co.gatewayBasics.new'),
          props.gatewayDetails.provider.name,
          getString('ce.co.gatewayBasics.account')
        ].join(' ')}
      </span>
    </div>
  )
}

export default COGatewayBasics

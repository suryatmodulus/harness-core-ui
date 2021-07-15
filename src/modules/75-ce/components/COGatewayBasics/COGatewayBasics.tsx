import React, { useEffect, useState } from 'react'
import { Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import createConnectorModal from '@ce/components/Connectors/createConnectorModal'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Utils } from '@ce/common/Utils'
import { Connectors } from '@connectors/constants'

interface COGatewayBasicsProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  setCloudAccount: (s: string) => void
  provider?: string
}

const COGatewayBasics: React.FC<COGatewayBasicsProps> = props => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const handleConnectorCreationSuccess = (data: ConnectorInfoDTO | undefined): void => {
    handleConnectorSelection(data as ConnectorInfoDTO)
  }
  const { openConnectorModal } = createConnectorModal({
    onSuccess: handleConnectorCreationSuccess
    // onClose: () => {
    // }
  })
  const { openConnectorModal: openAzureConnectorModal } = useCreateConnectorModal({
    onSuccess: data => {
      handleConnectorCreationSuccess(data?.connector)
    }
  })
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorInfoDTO | null>(null)

  useEffect(() => {
    if (selectedConnector) {
      setSelectedConnector(null)
    }
  }, [props.gatewayDetails.provider.value])

  const handleConnectorSelection = (data: ConnectorInfoDTO): void => {
    setSelectedConnector(data)
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.cloudAccount = { id: data.identifier?.toString(), name: data.name }
    updatedGatewayDetails.metadata.cloud_provider_details = { name: data.name }
    props.setGatewayDetails(updatedGatewayDetails)
    props.setCloudAccount(updatedGatewayDetails.cloudAccount.id)
    trackEvent('SelectingExistingConnector', {})
  }

  useEffect(() => {
    if (props.provider) {
      switch (props.provider) {
        case 'CEAws':
          openConnectorModal(false, 'CEAws')
          break
        case 'CEAzure':
          openAzureConnectorModal(false, Connectors.CE_AZURE, {
            connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
          })
          break
        default:
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.provider])

  return (
    <div>
      <Layout.Vertical spacing="large">
        <ConnectorReferenceField
          name="cloudAccount"
          // category={'CLOUD_COST'}
          selected={props.gatewayDetails.cloudAccount.id || selectedConnector?.identifier}
          label={[
            getString('ce.co.gatewayBasics.connect'),
            props.gatewayDetails.provider.name,
            getString('rbac.account')
          ].join(' ')}
          placeholder={getString('ce.co.gatewayBasics.select')}
          accountIdentifier={accountId}
          onChange={handleConnectorSelection}
          type={
            props.gatewayDetails.provider.value
              ? props.gatewayDetails.provider.value === 'aws'
                ? Connectors.CEAWS
                : Connectors.CE_AZURE
              : undefined
          }
        />
      </Layout.Vertical>
      <span
        onClick={() => {
          if (isAwsProvider) {
            openConnectorModal(false, 'CEAws')
          } else {
            openAzureConnectorModal(false, Connectors.CE_AZURE, {
              connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
            })
          }
          trackEvent('MadeNewConnector', {})
        }}
        style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
      >
        {[
          '+',
          getString('ce.co.gatewayBasics.new'),
          props.gatewayDetails.provider.name,
          getString('rbac.account')
        ].join(' ')}
      </span>
      {localStorage.CENGAWSCONNECTOR && (
        <div>
          <span
            onClick={() => {
              openAzureConnectorModal(false, Connectors.CEAWS, {
                connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
              })
            }}
            style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
          >
            Try AWS New Connector
          </span>
        </div>
      )}
    </div>
  )
}

export default COGatewayBasics

import React, { useState } from 'react'
import { Color, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'

import COProviderSelector from '@ce/components/COProviderSelector/COProviderSelector'
import COGatewayDetails from '@ce/components/COGatewayDetails/COGatewayDetails'
import type { GatewayDetails } from './models'

function getString(val: string | undefined): string {
  const stringVal = val?.toString()
  if (stringVal != undefined) {
    return stringVal
  }
  return ''
}

export const CECODashboardPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const gatewayCreationTabs = ['providerSelector', 'gatewayConfig']
  const [currentTab, setCurrentTab] = useState<string | 'providerSelector'>('providerSelector')
  const initialGatewayDetails: GatewayDetails = {
    name: '',
    cloudAccount: {
      id: '',
      name: ''
    },
    idleTimeMins: 15,
    fullfilment: '',
    filter: '',
    kind: 'instance',
    orgID: getString(orgIdentifier),
    projectID: getString(projectIdentifier),
    accountID: accountId,
    hostName: '',
    customDomains: [],
    matchAllSubdomains: false,
    disabled: false,
    routing: {
      instance: {
        filterText: ''
      },
      lb: '',
      ports: []
    },
    healthCheck: {
      protocol: 'http',
      path: '/',
      port: 80,
      timeout: 30
    },
    opts: {
      preservePrivateIP: false,
      deleteCloudResources: false,
      alwaysUsePrivateIP: false
    },
    provider: {
      name: 'Azure',
      value: 'azure',
      icon: 'service-azure'
    },
    selectedInstances: [],
    accessPointID: '',
    metadata: {},
    deps: []
  }
  const [gatewayDetails, setGatewayDetails] = useState<GatewayDetails>(initialGatewayDetails)
  const nextTab = (): void => {
    const tabIndex = gatewayCreationTabs.findIndex(t => t == currentTab)
    if (tabIndex < gatewayCreationTabs.length - 1) {
      setCurrentTab(gatewayCreationTabs[tabIndex + 1])
    }
  }
  const previousTab = (): void => {
    const tabIndex = gatewayCreationTabs.findIndex(t => t == currentTab)
    if (tabIndex > 0) {
      setCurrentTab(gatewayCreationTabs[tabIndex - 1])
    }
  }
  return (
    <Container background={Color.WHITE} height="100vh">
      {currentTab == 'providerSelector' ? (
        <COProviderSelector nextTab={nextTab} setGatewayDetails={setGatewayDetails} gatewayDetails={gatewayDetails} />
      ) : null}

      {currentTab == 'gatewayConfig' ? (
        <COGatewayDetails
          previousTab={previousTab}
          gatewayDetails={gatewayDetails}
          setGatewayDetails={setGatewayDetails}
        />
      ) : null}
    </Container>
  )
}

export default CECODashboardPage

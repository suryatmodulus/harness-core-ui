import React, { useState } from 'react'
import { Color, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import COProviderSelector from '@ce/components/COProviderSelector/COProviderSelector'
import { useQueryParams } from '@common/hooks'
import COGatewayDetails from '@ce/components/COGatewayDetails/COGatewayDetails'
import { Utils } from '@ce/common/Utils'
// import type { Provider } from '@ce/components/COCreateGateway/models'
import { GatewayKindType } from '@ce/constants'
import type { GatewayDetails } from './models'

function getString(val: string | undefined): string {
  const stringVal = val?.toString()
  if (stringVal != undefined) {
    return stringVal
  }
  return ''
}

export const CECODashboardPage: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { provider } = useQueryParams<{ provider: string }>()
  const gatewayCreationTabs = ['providerSelector', 'gatewayConfig']
  const [currentTab, setCurrentTab] = useState<string | 'providerSelector'>('providerSelector')
  // const initialProvider: Provider = provider
  //   ? {
  //       name: 'AWS',
  //       value: 'aws',
  //       icon: 'service-aws'
  //     }
  //   : {
  //       name: 'Azure',
  //       value: 'azure',
  //       icon: 'service-azure'
  //     }

  const initialGatewayDetails: GatewayDetails = {
    name: '',
    cloudAccount: {
      id: '',
      name: ''
    },
    idleTimeMins: 15,
    fullfilment: '',
    filter: '',
    kind: GatewayKindType.INSTANCE,
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
    healthCheck: Utils.getDefaultRuleHealthCheck(),
    opts: {
      preservePrivateIP: false,
      deleteCloudResources: false,
      alwaysUsePrivateIP: false,
      hide_progress_page: false
    },
    provider: {
      icon: '',
      name: '',
      value: ''
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
      {currentTab === 'providerSelector' && (
        <COProviderSelector
          nextTab={nextTab}
          setGatewayDetails={setGatewayDetails}
          gatewayDetails={gatewayDetails}
          provider={provider}
        />
      )}

      {currentTab == 'gatewayConfig' && (
        <COGatewayDetails
          previousTab={previousTab}
          gatewayDetails={gatewayDetails}
          setGatewayDetails={setGatewayDetails}
          isEditFlow={false}
        />
      )}
    </Container>
  )
}

export default CECODashboardPage

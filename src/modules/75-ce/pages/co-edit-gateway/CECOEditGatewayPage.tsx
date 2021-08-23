import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import COGatewayDetails from '@ce/components/COGatewayDetails/COGatewayDetails'
import type {
  GatewayDetails,
  Routing,
  InstanceDetails,
  Provider,
  ConnectionMetadata
} from '@ce/components/COCreateGateway/models'
import {
  HealthCheck,
  PortConfig,
  Service,
  ServiceDep,
  ServiceMetadata,
  useAllServiceResources,
  useRouteDetails
} from 'services/lw'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { allProviders, GatewayKindType, PROVIDER_TYPES } from '@ce/constants'

export const CECOEditGatewayPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, gatewayIdentifier } = useParams<
    ProjectPathProps & { gatewayIdentifier: string }
  >()

  const { data, loading } = useRouteDetails({
    account_id: accountId,
    rule_id: gatewayIdentifier as unknown as number,
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const {
    data: resources,
    loading: resourcesLoading,
    refetch: fetchResources
  } = useAllServiceResources({
    account_id: accountId,
    rule_id: gatewayIdentifier as unknown as number,
    debounce: 300,
    lazy: true
  })

  const [gatewayDetails, setGatewayDetails] = useState<GatewayDetails>()

  useEffect(() => {
    if (loading) return
    const service = data?.response?.service as Service
    const deps = data?.response?.deps as ServiceDep[]
    const hasAsg = !_isEmpty(service.routing?.instance?.scale_group)
    const isK8sRule = service.kind === GatewayKindType.KUBERNETES

    // If there is an instance kind rule, then only fetch resources
    // don't fetch resources for ASG or K8s kind rule
    if (!isK8sRule && !hasAsg && !resources) {
      fetchResources()
      return
    }
    const routing: Routing = {
      instance: { filterText: service.routing?.instance?.filter_text as string },
      ports: service.routing?.ports as PortConfig[],
      lb: ''
    }
    let selectedInstances: InstanceDetails[] = []
    let providerType = PROVIDER_TYPES.AWS.valueOf()
    if (hasAsg) {
      routing.instance.scale_group = service.routing?.instance?.scale_group // eslint-disable-line
    } else if (isK8sRule) {
      routing.k8s = {
        RuleJson: service.routing?.k8s?.RuleJson as string,
        ConnectorID: service.metadata?.kubernetes_connector_id as string
      }
    } else {
      providerType = resources?.response?.[0]?.provider_type || providerType
      const selectedResources = resources?.response ? resources?.response : []
      selectedInstances = selectedResources.map(item => {
        return {
          name: item.name ? item.name : '',
          id: item.id ? item.id : '',
          ipv4: item.ipv4 ? item.ipv4[0] : '',
          region: item.region ? item.region : '',
          type: item.type ? item.type : '',
          tags: '',
          launch_time: item.launch_time ? item.launch_time : '', // eslint-disable-line
          status: item.status ? item.status : '',
          vpc: item.metadata ? item.metadata['VpcID'] : '',
          ...(providerType === PROVIDER_TYPES.AZURE && { metadata: { resourceGroup: item.metadata?.resourceGroup } })
        }
      })
    }
    const gwDetails: GatewayDetails = {
      id: service.id,
      name: service.name,
      idleTimeMins: service.idle_time_mins as number,
      fullfilment: service.fulfilment as string,
      filter: service.routing?.instance?.filter_text as string,
      kind: service.kind,
      healthCheck: service.health_check as HealthCheck,
      hostName: service.host_name,
      routing,
      opts: {
        preservePrivateIP: service.opts?.preserve_private_ip as boolean,
        deleteCloudResources: service.opts?.delete_cloud_resources as boolean,
        alwaysUsePrivateIP: service.opts?.always_use_private_ip as boolean,
        access_details: service.opts?.access_details as ConnectionMetadata
      },
      provider: allProviders.find(provider => provider.value === providerType) as Provider,
      selectedInstances: selectedInstances,
      accessPointID: service.access_point_id as string,
      accountID: accountId,
      orgID: orgIdentifier,
      projectID: projectIdentifier,
      cloudAccount: {
        id: service.cloud_account_id,
        name: service.metadata?.cloud_provider_details?.name as string
      },
      metadata: service.metadata as ServiceMetadata,
      customDomains: service.custom_domains,
      deps: deps
    }
    setGatewayDetails(gwDetails)
  }, [data, resources])

  return (
    <>
      {!loading && !resourcesLoading && gatewayDetails ? (
        <COGatewayDetails
          gatewayDetails={gatewayDetails as GatewayDetails}
          setGatewayDetails={setGatewayDetails}
          previousTab={() => undefined}
          isEditFlow={true}
        />
      ) : (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
    </>
  )
}

export default CECOEditGatewayPage

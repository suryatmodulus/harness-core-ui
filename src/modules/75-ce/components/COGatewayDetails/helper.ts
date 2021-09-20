import { isEmpty as _isEmpty } from 'lodash-es'
import { ASRuleTabs, GatewayKindType } from '@ce/constants'
import type { RoutingData, Service } from 'services/lw'
import { Utils } from '@ce/common/Utils'
import type { GatewayDetails } from '../COCreateGateway/models'

const tabs = [ASRuleTabs.CONFIGURATION, ASRuleTabs.SETUP_ACCESS, ASRuleTabs.REVIEW]

export const trackPrimaryBtnClick = (
  selectedTabId: string,
  dataToTrack: Record<ASRuleTabs, any>,
  trackEvent: (eventName: string, properties: Record<string, string>) => void
) => {
  switch (selectedTabId) {
    case tabs[0]:
      trackEvent('VisitedSetupAccessPage', {})
      break
    case tabs[1]:
      trackEvent('CompletedSetupAccess', dataToTrack[selectedTabId] || {})
      break
    case tabs[2]:
      trackEvent('AutoStoppingRuleCompleted', {})
      break
  }
}

export const isPrimaryBtnDisable = (
  selectedTabId: string,
  validTabs: { config: boolean; setupAccess: boolean },
  bypassCheck = false
) => {
  if (bypassCheck) {
    return true
  }
  return (
    (selectedTabId === tabs[0] && !validTabs.config) ||
    (selectedTabId === tabs[1] && !validTabs.setupAccess) ||
    (selectedTabId === tabs[2] && (!validTabs.setupAccess || !validTabs.config))
  )
}

export const getServiceObjectFromgatewayDetails = (
  gatewayDetails: GatewayDetails,
  orgIdentifier: string,
  projectIdentifier: string,
  accountId: string
): Service => {
  const hasInstances = !_isEmpty(gatewayDetails.selectedInstances)
  const isK8sRule = Utils.isK8sRule(gatewayDetails)
  const routing: RoutingData = { ports: gatewayDetails.routing.ports, lb: undefined }
  if (isK8sRule) {
    routing.k8s = gatewayDetails.routing.k8s
  } else if (hasInstances) {
    const instanceIDs = gatewayDetails.selectedInstances.map(instance => `'${instance.id}'`).join(',')
    routing.instance = {
      filter_text: `id = [${instanceIDs}]` // eslint-disable-line
    }
  } else {
    routing.instance = {
      filter_text: '', // eslint-disable-line
      scale_group: gatewayDetails.routing.instance.scale_group // eslint-disable-line
    }
  }
  routing.custom_domain_providers = gatewayDetails.routing.custom_domain_providers
  const gateway: Service = {
    name: gatewayDetails.name,
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_identifier: accountId, // eslint-disable-line
    fulfilment: isK8sRule ? 'kubernetes' : gatewayDetails.fullfilment || 'ondemand',
    kind: isK8sRule ? GatewayKindType.KUBERNETES : GatewayKindType.INSTANCE,
    cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
    idle_time_mins: gatewayDetails.idleTimeMins, // eslint-disable-line
    custom_domains: gatewayDetails.customDomains ? gatewayDetails.customDomains : [], // eslint-disable-line
    health_check: gatewayDetails.healthCheck,
    routing,
    opts: {
      preserve_private_ip: false, // eslint-disable-line
      always_use_private_ip: false, // eslint-disable-line
      access_details: gatewayDetails.opts.access_details // eslint-disable-line
    },
    metadata: gatewayDetails.metadata,
    disabled: gatewayDetails.disabled,
    match_all_subdomains: gatewayDetails.matchAllSubdomains, // eslint-disable-line
    access_point_id: gatewayDetails.accessPointID // eslint-disable-line
  }
  if (gatewayDetails.id) {
    gateway.id = gatewayDetails.id
  }
  return gateway
}

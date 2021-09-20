import { isEmpty as _isEmpty } from 'lodash-es'
import type { ConnectionMetadata, GatewayDetails } from '../COCreateGateway/models'

export const getSelectedTabId = (accessDetails: ConnectionMetadata): string => {
  let tabId = ''
  if (accessDetails.dnsLink.selected) {
    tabId = 'dns'
  }
  if (accessDetails.ssh.selected) {
    tabId = 'ssh'
  }
  if (accessDetails.ipaddress.selected) {
    tabId = 'ip'
  }
  if (accessDetails.rdp.selected) {
    tabId = 'rdp'
  }
  if (accessDetails.backgroundTasks.selected) {
    tabId = 'bg'
  }
  return tabId
}

export const getValidStatusForDnsLink = (gatewayDetails: GatewayDetails): boolean => {
  let validStatus = true
  // check for custom domains validation
  if (gatewayDetails.customDomains?.length) {
    validStatus = gatewayDetails.customDomains.every(url =>
      url.match(
        /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
      )
    )
    if (
      !gatewayDetails.routing.custom_domain_providers?.others &&
      !gatewayDetails.routing.custom_domain_providers?.route53?.hosted_zone_id
    ) {
      validStatus = false
    }
  }
  // checck for valid access point selected
  if (_isEmpty(gatewayDetails.accessPointID)) {
    validStatus = false
  }

  // check for routing ports
  if (validStatus && _isEmpty(gatewayDetails.routing.ports)) {
    validStatus = false
  }
  return validStatus
}

export const getHelpText = (selectedTabId: string) => {
  let helpTextBase = 'setup-access'
  if (selectedTabId !== '') {
    helpTextBase = `${helpTextBase}-${selectedTabId}`
  }
  return helpTextBase
}

import { isEmpty as _isEmpty } from 'lodash-es'
import type { Resource } from 'services/lw'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { RESOURCES } from '@ce/constants'
import { Utils } from '@ce/common/Utils'

class InstanceData implements InstanceDetails {
  name: string
  id: string
  ipv4: string
  region: string
  type: string
  tags: string
  launch_time: string
  status: string
  vpc: string
  metadata: { [key: string]: any } | undefined
  constructor() {
    this.name = ''
    this.id = ''
    this.ipv4 = ''
    this.region = ''
    this.type = ''
    this.tags = ''
    this.launch_time = ''
    this.status = ''
    this.vpc = ''
  }

  setName(name: string) {
    this.name = name
    return this
  }

  setId(id: string) {
    this.id = id
    return this
  }

  setIp(ip: string) {
    this.ipv4 = ip
    return this
  }

  setRegion(region: string) {
    this.region = region
    return this
  }

  setType(type: string) {
    this.type = type
    return this
  }

  setTags(tags: string) {
    this.tags = tags
    return this
  }

  setLaunchTime(time: string) {
    this.launch_time = time
    return this
  }

  setStatus(status: string) {
    this.status = status
    return this
  }

  setVpc(vpc: string) {
    this.vpc = vpc
    return this
  }

  setMetadata(meta: { [key: string]: any }) {
    this.metadata = meta
    return this
  }
}

export const fromResourceToInstanceDetails = (item: Resource, addMeta: boolean) => {
  const instanceDetails = new InstanceData()
    .setName(item.name as string)
    .setId(item.id as string)
    .setIp(item.ipv4?.[0] as string)
    .setRegion(item.region as string)
    .setType(item.type as string)
    .setLaunchTime(item.launch_time as string)
    .setStatus(item.status as string)
    .setVpc(item.metadata?.['vpcID'] as string)
  if (addMeta) {
    instanceDetails.setMetadata({ resourceGroup: item.metadata?.resourceGroup })
  }
  return instanceDetails
}

export const isFFEnabledForResource = (flags: string[] | undefined, featureFlagsMap: Record<string, boolean>) => {
  let enableStatus = true
  if (!flags || _isEmpty(flags)) {
    return enableStatus
  }
  flags.forEach(_flag => {
    if (!featureFlagsMap[_flag]) {
      enableStatus = false
    }
  })
  return enableStatus
}

export const isActiveStep = (stepEl: HTMLElement, parentEl: HTMLDivElement) => {
  const parentElVal = parentEl.getBoundingClientRect()
  const { top, bottom, height } = stepEl.getBoundingClientRect()
  return (
    (top > parentElVal.top || bottom - parentElVal.top > 100) &&
    (bottom <= parentElVal.bottom || (height >= parentElVal.height ? bottom > parentElVal.bottom : false))
  )
}

export const getSelectedResourceFromGatewayDetails = (gatewayDetails: GatewayDetails) => {
  return !_isEmpty(gatewayDetails.selectedInstances)
    ? RESOURCES.INSTANCES
    : !_isEmpty(gatewayDetails.routing?.instance?.scale_group)
    ? RESOURCES.ASG
    : Utils.isK8sRule(gatewayDetails)
    ? RESOURCES.KUBERNETES
    : null
}

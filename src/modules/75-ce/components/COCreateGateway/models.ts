import type { AccessPoint, ASGMinimal, HealthCheck, PortConfig, ServiceDep, ServiceMetadata } from 'services/lw'

interface Instance {
  filterText: string
  scale_group?: ASGMinimal
}
interface CloudAccount {
  id: string
  name: string
}

export interface Routing {
  instance: Instance
  lb: string
  ports: PortConfig[]
  k8s?: {
    RuleJson: string
    ConnectorID: string
  }
  custom_domain_providers?: { [key: string]: any }
}

interface ServiceOpts {
  access_details?: { [key: string]: any }
  preservePrivateIP: boolean
  deleteCloudResources: boolean
  alwaysUsePrivateIP: boolean
  hide_progress_page: boolean
}

export interface Provider {
  name: string
  icon: string
  value: string
}
export interface InstanceDetails {
  id: string
  name: string
  ipv4?: string
  region: string
  type: string
  tags?: string
  launch_time?: string // eslint-disable-line
  status: string
  vpc: string
  metadata?: { [key: string]: any }
}
export interface GatewayDetails {
  id?: number
  name: string
  cloudAccount: CloudAccount
  idleTimeMins: number
  fullfilment: string
  filter: string
  kind: string
  orgID: string
  projectID: string
  hostName?: string
  customDomains?: string[]
  matchAllSubdomains?: boolean
  disabled?: boolean
  routing: Routing
  healthCheck: HealthCheck | null
  opts: ServiceOpts
  provider: Provider
  selectedInstances: InstanceDetails[]
  accessPointID: string
  accountID: string
  metadata: ServiceMetadata
  deps: ServiceDep[]
  accessPointData?: AccessPoint // only for read purpose
}

interface DNSLink {
  selected: boolean
  public?: string
}
interface SSH {
  selected: boolean
}

interface RDP {
  selected: boolean
}
interface BackgroundTasks {
  selected: boolean
}
interface IpAddress {
  selected: boolean
}
export interface ConnectionMetadata {
  dnsLink: DNSLink
  ssh: SSH
  rdp: RDP
  backgroundTasks: BackgroundTasks
  ipaddress: IpAddress
}

export interface CustomDomainDetails {
  route53?: {
    hosted_zone_id: string
  }
}

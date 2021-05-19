import type { DelegateSetupDetails } from 'services/portal'

export interface DelegateInfoDTO {
  name: string
  identifier: string
  description?: string
  orgIdentifier?: string
  projectIdentifier?: string
  tags?: {
    [key: string]: string
  }
  type: 'K8sCluster'
}

export interface DelegateConfigDTO {
  [key: string]: any
}

export interface DelegateProfile {
  uuid: string
  accountId?: string
  name?: string
  description?: string
  primary?: boolean
  approvalRequired?: boolean
  startupScript?: string
  selectors?: string[]
  lastUpdatedAt?: number
  scopingRules?: string[]
}

export interface StepK8Data {
  delegateYaml: DelegateSetupDetails | undefined
  replicas: number | undefined
}

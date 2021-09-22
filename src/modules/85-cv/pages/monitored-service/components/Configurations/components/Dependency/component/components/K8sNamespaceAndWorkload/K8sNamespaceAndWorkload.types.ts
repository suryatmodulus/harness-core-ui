import type { InfrastructureDependencyMetaData } from '../../SelectServiceCard.types'

export interface K8sNamespaceAndWorkloadProps {
  connectorIdentifier?: string
  onChange: (namespace?: string, workload?: string) => void
  dependencyMetaData?: InfrastructureDependencyMetaData
}

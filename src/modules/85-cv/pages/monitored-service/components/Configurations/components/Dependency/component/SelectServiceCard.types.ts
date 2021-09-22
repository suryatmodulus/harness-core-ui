import type { MonitoredServiceDTO } from 'services/cv'

export interface ServiceCardInterfaceProps {
  monitoredService: MonitoredServiceDTO
  dependencyMetaData?: DependencyMetaData
  onChange: (isChecked: boolean, dependencyMetaData?: DependencyMetaData) => void
}

export interface ServiceCardWithAccordianInterfaceProps {
  id: string
  summary: React.ReactNode
  details: JSX.Element
}

export interface DependencyMetaData {
  monitoredServiceIdentifier: string
  dependencyMetadata?: Record<string, unknown>
}

export interface InfrastructureDependencyMetaData extends DependencyMetaData {
  dependencyMetadata: {
    type: 'KUBERNETES'
    namespace?: string
    workload?: string
  }
}

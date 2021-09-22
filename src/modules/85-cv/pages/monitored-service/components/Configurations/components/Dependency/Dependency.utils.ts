import type { ResponsePageMonitoredServiceResponse } from 'services/cv'
import type { MonitoredServiceForm } from '../Service/Service.types'
import type { DependencyMetaData } from './component/SelectServiceCard.types'

export function updateMonitoredServiceWithDependencies(
  dependencies: DependencyMetaData[],
  monitoredService: MonitoredServiceForm
): MonitoredServiceForm {
  monitoredService.dependencies = []
  for (const dependency of dependencies || []) {
    monitoredService.dependencies.push(dependency)
  }

  return monitoredService
}

export function filterCurrentMonitoredServiceFromList(
  response: ResponsePageMonitoredServiceResponse,
  identifier: string
): ResponsePageMonitoredServiceResponse {
  if (response?.data?.content?.length) {
    response.data.content = response.data.content.filter(
      item => item?.monitoredService && item.monitoredService.identifier !== identifier
    )
  }
  return response
}

export function initializeDependencyMap(
  dependencies?: MonitoredServiceForm['dependencies']
): Map<string, DependencyMetaData> {
  const dependencyMap = new Map<string, DependencyMetaData>()
  if (!dependencies?.length) return dependencyMap

  for (const dependency of dependencies) {
    if (dependency?.monitoredServiceIdentifier) {
      dependencyMap.set(dependency.monitoredServiceIdentifier, dependency as DependencyMetaData)
    }
  }

  return dependencyMap
}

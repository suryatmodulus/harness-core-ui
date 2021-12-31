import type { UseStringsReturn } from 'framework/strings'

export const COST_FILTER_KEYS = ['minSaving', 'minCost']

export function getFiltersLabelName(getString: UseStringsReturn['getString']): Record<string, string> {
  return {
    minSaving: getString('ce.recommendation.listPage.filters.minSaving'),
    minCost: getString('ce.recommendation.listPage.filters.minCost')
  }
}

export function getLabelMappingForFilters(getString: UseStringsReturn['getString']): Record<string, string> {
  return {
    clusterName: getString('ce.recommendation.listPage.filters.clusterName'),
    name: getString('ce.recommendation.listPage.filters.name'),
    resourceType: getString('common.resourceTypeLabel'),
    namespace: getString('ce.recommendation.listPage.filters.namespace'),
    clusterNames: getString('ce.recommendation.listPage.filters.clusterName'),
    names: getString('ce.recommendation.listPage.filters.name'),
    resourceTypes: getString('common.resourceTypeLabel'),
    namespaces: getString('ce.recommendation.listPage.filters.namespace')
  }
}

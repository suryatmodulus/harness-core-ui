import type { DependencyData, GraphData, Node } from '@cv/components/DependencyGraph/DependencyGraph.types'
import type { RestResponseServiceDependencyGraphDTO } from 'services/cv'

export const getDependencyData = (
  serviceDependencyGraphData: RestResponseServiceDependencyGraphDTO | null
): DependencyData | null => {
  let dependencyData = null
  if (serviceDependencyGraphData?.resource?.nodes && serviceDependencyGraphData.resource.nodes.length) {
    dependencyData = {
      nodes: serviceDependencyGraphData.resource.nodes.map(node => ({
        // TODO - monitored service name has to come from backend directly.
        id: `${node?.serviceRef}_${node?.environmentRef}`,
        status: node?.riskLevel,
        // TODO - This will be updated once Matts changes for new icon are merged
        icon: 'cd-main'
      })) as Node[],
      data: serviceDependencyGraphData?.resource?.edges as GraphData[]
    }
  }

  return dependencyData
}

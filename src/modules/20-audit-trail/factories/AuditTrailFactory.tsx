import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'

export type ResourceType = ResourceDTO['type']

interface ResourceHandler {
  moduleIcon: IconProps
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScopeDTO, module?: Module) => string | undefined
}

class AuditTrailFactory {
  private readonly map: Map<ResourceType, ResourceHandler>

  constructor() {
    this.map = new Map()
  }

  registerResourceHandler(resourceType: ResourceType, handler: ResourceHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceHandler(resourceType: ResourceType): ResourceHandler | undefined {
    return this.map.get(resourceType)
  }
}

export default new AuditTrailFactory()

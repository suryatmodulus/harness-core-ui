import type React from 'react'
import type { IconName } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type { ResourceType, ResourceTypeGroup } from '@rbac/interfaces/ResourceType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

export interface RbacResourceModalProps {
  searchTerm: string
  selectedData: string[]
  onSelectChange: (items: string[]) => void
}

export interface ResourceHandler {
  icon: IconName
  label: string | React.ReactElement
  permissionLabels?: {
    [key in PermissionIdentifier]?: string | React.ReactElement
  }
  addResourceModalBody?: (props: RbacResourceModalProps) => React.ReactElement
  category?: ResourceTypeGroup
}

export interface ResourceTypeGroupHandler {
  icon: IconName
  label: string | React.ReactElement
  resourceTypes?: Set<ResourceType>
}

class RbacFactory {
  private map: Map<ResourceType, ResourceHandler>
  private resourceTypeGroupMap: Map<ResourceTypeGroup | ResourceType, ResourceTypeGroupHandler>

  constructor() {
    this.map = new Map()
    this.resourceTypeGroupMap = new Map()
  }

  registerResourceTypeGroup(resourceTypeGroup: ResourceTypeGroup, handler: ResourceTypeGroupHandler): void {
    this.resourceTypeGroupMap.set(resourceTypeGroup, handler)
  }

  registerResourceTypeHandler(resourceType: ResourceType, handler: ResourceHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceGroupTypeList(resources: ResourceType[]): (ResourceTypeGroup | ResourceType)[] {
    resources.map(resourceType => {
      const handler = this.map.get(resourceType)
      if (handler) {
        if (handler.category) {
          const resourceTypeGroupHandler = this.resourceTypeGroupMap.get(handler.category)
          if (resourceTypeGroupHandler) {
            if (resourceTypeGroupHandler.resourceTypes) resourceTypeGroupHandler.resourceTypes.add(resourceType)
            else resourceTypeGroupHandler.resourceTypes = new Set([resourceType])
            this.resourceTypeGroupMap.set(handler.category, resourceTypeGroupHandler)
          }
        } else {
          this.resourceTypeGroupMap.set(resourceType, pick(handler, ['icon', 'label']))
        }
      }
    })

    return Array.from(this.resourceTypeGroupMap.keys())
  }

  getResourceGroupTypeHandler(
    resourceGroupType: ResourceType | ResourceTypeGroup
  ): ResourceTypeGroupHandler | undefined {
    return this.resourceTypeGroupMap.get(resourceGroupType)
  }

  getResourceTypeHandler(resourceType: ResourceType): ResourceHandler | undefined {
    return this.map.get(resourceType)
  }
}

export default new RbacFactory()

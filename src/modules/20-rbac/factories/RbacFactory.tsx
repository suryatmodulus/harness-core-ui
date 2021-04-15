import type React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceScope } from '@rbac/interfaces/ResourceScope'

export interface RbacResourceModalProps {
  searchTerm: string
  selectedData: string[]
  onSelectChange: (items: string[]) => void
  resourceScope: ResourceScope
}

export interface ResourceHandler {
  icon: IconName
  label: string | React.ReactElement
  permissionLabels?: {
    [key in PermissionIdentifier]?: string | React.ReactElement
  }
  addResourceModalBody?: (props: RbacResourceModalProps) => React.ReactElement
  category?: ResourceCategory
}

export interface ResourceCategoryHandler {
  icon: IconName
  label: string | React.ReactElement
  resourceTypes?: Set<ResourceType>
}

class RbacFactory {
  private map: Map<ResourceType, ResourceHandler>
  private resourceCategoryMap: Map<ResourceCategory, ResourceCategoryHandler>

  constructor() {
    this.map = new Map()
    this.resourceCategoryMap = new Map()
  }

  registerResourceCategory(resourceCategory: ResourceCategory, handler: ResourceCategoryHandler): void {
    this.resourceCategoryMap.set(resourceCategory, handler)
  }

  registerResourceTypeHandler(resourceType: ResourceType, handler: ResourceHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceCategoryList(resources: ResourceType[]): Map<ResourceCategory | ResourceType, ResourceType[] | undefined> {
    const categoryMap: Map<ResourceCategory | ResourceType, ResourceType[] | undefined> = new Map()

    resources.map(resourceType => {
      const handler = this.map.get(resourceType)
      if (handler) {
        if (handler.category) {
          const resourceTypes = categoryMap.get(handler.category)
          if (resourceTypes) {
            categoryMap.set(handler.category, [...resourceTypes, resourceType])
          } else categoryMap.set(handler.category, [resourceType])
        } else {
          categoryMap.set(resourceType, undefined)
        }
      }
    })

    return categoryMap
  }

  getResourceCategoryHandler(resourceCategory: ResourceCategory): ResourceCategoryHandler | undefined {
    return this.resourceCategoryMap.get(resourceCategory)
  }

  getResourceTypeHandler(resourceType: ResourceType): ResourceHandler | undefined {
    return this.map.get(resourceType)
  }
}

export default new RbacFactory()

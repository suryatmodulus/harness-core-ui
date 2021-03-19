import type React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { ResourceType } from '@rbac/interfaces/ResourceType'

export interface RbacResourceModalProps {
  searchTerm: string
  selectedData: string[]
  onSelectChange: (items: string[]) => void
}

export interface ResourceHandler {
  icon: IconName
  label: string
  addResourceModalBody?: (props: RbacResourceModalProps) => React.ReactElement
}

class RbacFactory {
  private map: Map<ResourceType, ResourceHandler>

  constructor() {
    this.map = new Map()
  }

  registerResourceTypeHandler(resourceType: ResourceType, handler: ResourceHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceTypeHandler(resourceType: ResourceType): ResourceHandler | undefined {
    return this.map.get(resourceType)
  }
}

export default new RbacFactory()

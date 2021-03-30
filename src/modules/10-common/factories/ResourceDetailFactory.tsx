import type React from 'react'
import type { ResourceType } from '@common/interfaces/ResourceType'

interface ResourceDetailHandler {
  getResourceDetailViewAndAction: (props: any) => React.ReactElement
}

class ResourceDetailFactory {
  private map: Map<ResourceType, ResourceDetailHandler>

  constructor() {
    this.map = new Map()
  }


  registerResourceDetailTypeHandler(resourceType: ResourceType, handler: ResourceDetailHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceDetailTypeHandler(resourceType: ResourceType): ResourceDetailHandler | undefined {
    return this.map.get(resourceType)
  }
}

export default new ResourceDetailFactory()

import React from 'react'
import type { ResourceHandler, ResourceTypeGroupHandler } from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceTypeGroup } from '@rbac/interfaces/ResourceType'

export const getResourceTypeHandlerMock = (resource: ResourceType): ResourceHandler | undefined => {
  switch (resource) {
    case ResourceType.PROJECT:
      return {
        icon: 'nav-project',
        label: 'Projects',
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.ORGANIZATION:
      return {
        icon: 'nav-project',
        label: 'Organizations',
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.SECRET:
      return {
        icon: 'lock',
        label: 'Secrets',
        category: ResourceTypeGroup.PROJECT_RESOURCES,
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
  }
}

export const getResourceGroupTypeHandlerMock = (
  resource: ResourceType | ResourceTypeGroup
): ResourceTypeGroupHandler | undefined => {
  switch (resource) {
    case ResourceTypeGroup.PROJECT_RESOURCES:
      return {
        icon: 'nav-project',
        label: 'Project Resources',
        resourceTypes: new Set([ResourceType.SECRET])
      }
    case ResourceTypeGroup.ADMINSTRATIVE_FUNCTIONS:
      return {
        icon: 'nav-project',
        label: 'Administrative Fucntions',
        resourceTypes: new Set([ResourceType.ORGANIZATION, ResourceType.PROJECT])
      }
  }
}

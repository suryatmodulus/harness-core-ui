import React from 'react'
import type { ResourceHandler, ResourceCategoryHandler } from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/exports'

export const getResourceTypeHandlerMock = (resource: ResourceType): ResourceHandler | undefined => {
  switch (resource) {
    case ResourceType.PROJECT:
      return {
        icon: 'nav-project',
        label: 'Projects',
        category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
        permissionLabels: {
          [PermissionIdentifier.UPDATE_PROJECT]: <String stringID="rbac.permissionLabels.createEdit" />,
          [PermissionIdentifier.VIEW_PROJECT]: <String stringID="rbac.permissionLabels.view" />,
          [PermissionIdentifier.DELETE_PROJECT]: <String stringID="rbac.permissionLabels.delete" />
        },
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.ORGANIZATION:
      return {
        icon: 'settings',
        label: 'Organizations',
        category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
        permissionLabels: {
          [PermissionIdentifier.UPDATE_ORG]: <String stringID="rbac.permissionLabels.createEdit" />,
          [PermissionIdentifier.VIEW_ORG]: <String stringID="rbac.permissionLabels.view" />,
          [PermissionIdentifier.DELETE_ORG]: <String stringID="rbac.permissionLabels.delete" />
        },
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.SECRET:
      return {
        icon: 'lock',
        label: 'Secrets',
        category: ResourceCategory.PROJECT_RESOURCES,
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
  }
}

export const getResourceGroupTypeHandlerMock = (
  resource: ResourceType | ResourceCategory
): ResourceCategoryHandler | undefined => {
  switch (resource) {
    case ResourceCategory.PROJECT_RESOURCES:
      return {
        icon: 'nav-project',
        label: 'Project Resources'
      }
    case ResourceCategory.ADMINSTRATIVE_FUNCTIONS:
      return {
        icon: 'nav-project',
        label: 'Administrative Fucntions'
      }
  }
}

export const getResourceCategoryListMock = (): Map<ResourceCategory | ResourceType, ResourceType[] | undefined> => {
  const mockMap = new Map()
  mockMap.set(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, [ResourceType.ORGANIZATION, ResourceType.PROJECT])
  mockMap.set(ResourceCategory.PROJECT_RESOURCES, [ResourceType.SECRET, ResourceType.CONNECTOR])
  return mockMap
}

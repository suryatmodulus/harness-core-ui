/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { AuditEventDTO, ResourceDTO, ResourceScopeDTO } from 'services/audit'

export type ResourceType = ResourceDTO['type']

export interface ResourceScope extends ResourceScopeDTO {
  accountIdentifier: string
}

export const getModuleNameFromAuditModule = (auditModule: AuditEventDTO['module']): Module | undefined => {
  switch (auditModule) {
    case 'CD':
      return 'cd'
    case 'CI':
      return 'ci'
    case 'CF':
      return 'cf'
    case 'CE':
      return 'ce'
    case 'CV':
      return 'cv'
  }
  return undefined
}

interface ResourceHandler {
  moduleIcon: IconProps
  resourceUrl?: (resource: ResourceDTO, resourceScope: ResourceScope, module?: Module) => string | undefined
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

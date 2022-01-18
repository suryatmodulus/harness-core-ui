/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

const mockPermission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier } = {
  resource: { resourceType: ResourceType.FEATUREFLAG },
  permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
}

export default mockPermission

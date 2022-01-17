/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Container, Text } from '@wings-software/uicore'
import type { Segment } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import useDeleteTargetGroupDialog from '../hooks/useDeleteTargetGroupDialog'

import css from './TargetGroupHeader.module.scss'

export interface TargetGroupHeaderProps {
  targetGroup: Segment
  env: EnvironmentResponseDTO
}

const TargetGroupHeader: FC<TargetGroupHeaderProps> = ({ targetGroup, env }) => {
  const { getString } = useStrings()
  const deleteTargetGroupDialog = useDeleteTargetGroupDialog(targetGroup)

  return (
    <>
      <Container className={css.optionsMenu}>
        <RbacOptionsMenuButton
          items={[
            {
              icon: 'cross',
              text: getString('delete'),
              onClick: deleteTargetGroupDialog,
              permission: {
                resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: targetGroup.environment },
                permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
              }
            }
          ]}
        />
      </Container>
      <Text className={css.metaData}>
        <strong>{getString('environment')}:</strong> {env.name}
      </Text>
    </>
  )
}

export default TargetGroupHeader

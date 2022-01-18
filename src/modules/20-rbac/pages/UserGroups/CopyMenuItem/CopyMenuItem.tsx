/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelectOption, useModalHook, Dialog } from '@wings-software/uicore'
import type { ProjectSelectOption } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import { useStrings } from 'framework/strings'
import CopyGroupForm from './CopyGroupForm'

export interface CopyGroupFormType {
  organizations: MultiSelectOption[]
  projects: ProjectSelectOption[]
}

interface CopyMenuItemProps {
  userGroupName: string
}

const CopyMenuItem: React.FC<CopyMenuItemProps> = ({ userGroupName }) => {
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        title={getString('rbac.copyGroupTitle', { name: userGroupName })}
        onClose={hideModal}
      >
        <CopyGroupForm handleFormClose={hideModal} />
      </Dialog>
    )
  }, [])
  return (
    <MenuItem
      icon="duplicate"
      text={getString('common.copy')}
      onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        showModal()
      }}
    />
  )
}

export default CopyMenuItem

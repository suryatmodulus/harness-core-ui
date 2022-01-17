/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useModalHook, Button } from '@wings-software/uicore'
import { Classes, Dialog } from '@blueprintjs/core'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import AddResourceModal from './views/AddResourceModal'
import css from './useAddResourceModal.module.scss'

export interface UseAddResourceModalProps {
  onSuccess: (resources: string[]) => void
}

export interface UseAddResourceModalReturn {
  openAddResourceModal: (resource: ResourceType, selectedItems: string[]) => void
  closeAddResourceModal: () => void
}

const useAddResourceModal = (props: UseAddResourceModalProps): UseAddResourceModalReturn => {
  const [resource, setResource] = useState<ResourceType>()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { onSuccess } = props
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        {resource && (
          <AddResourceModal
            resource={resource}
            onSuccess={resources => {
              onSuccess(resources)
              hideModal()
            }}
            selectedData={selectedItems}
            onClose={hideModal}
          />
        )}
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [resource, selectedItems]
  )

  return {
    openAddResourceModal: (_resource: ResourceType, _selectedItems: string[]) => {
      setResource(_resource)
      setSelectedItems(_selectedItems)
      showModal()
    },
    closeAddResourceModal: hideModal
  }
}

export default useAddResourceModal

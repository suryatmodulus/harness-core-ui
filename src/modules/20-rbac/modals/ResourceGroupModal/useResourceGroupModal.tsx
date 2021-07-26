import React, { useCallback, useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ResourceGroupDTO } from 'services/resourcegroups'
import ResourceGroupModalFrom from './views/ResourceGroupModalForm'

export interface UseResourceGroupModalProps {
  onSuccess: (resourceGroup: ResourceGroupDTO) => void
  onCloseModal?: () => void
}

export interface UseResourceGroupModalReturn {
  openResourceGroupModal: () => void
  closeResourceGroupModal: () => void
}

export const useResourceGroupModal = ({ onSuccess }: UseResourceGroupModalProps): UseResourceGroupModalReturn => {
  const [resourceGroupData, setResourceGroupData] = useState<ResourceGroupDTO>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        title={
          resourceGroupData
            ? getString('rbac.resourceGroup.updateResourceGroupDialogTitle')
            : getString('rbac.resourceGroup.newResourceGroup')
        }
        onClose={() => {
          hideModal()
        }}
      >
        <ResourceGroupModalFrom
          data={resourceGroupData}
          onSubmit={resourceGroup => {
            onSuccess(resourceGroup)
            hideModal()
          }}
          editMode={!!resourceGroupData}
        />
      </Dialog>
    ),
    [resourceGroupData]
  )
  const open = useCallback(
    (_resourceGroup?: ResourceGroupDTO) => {
      setResourceGroupData(_resourceGroup)
      showModal()
    },
    [showModal]
  )
  return {
    openResourceGroupModal: (resourceGroup?: ResourceGroupDTO) => open(resourceGroup),
    closeResourceGroupModal: hideModal
  }
}

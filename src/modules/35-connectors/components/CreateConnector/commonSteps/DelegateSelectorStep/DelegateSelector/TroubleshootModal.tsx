import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import DelegateInstallationError from '@delegates/components/CreateDelegate/K8sDelegate/DelegateInstallationError/DelegateInstallationError'

export interface UseTroubleshootModalReturn {
  showModal: () => void
  hideModal: () => void
}

export const useTroubleshootModal = (): UseTroubleshootModalReturn => {
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={Classes.DIALOG}
        style={{
          width: 'auto'
        }}
      >
        <DelegateInstallationError />
      </Dialog>
    )
  }, [])

  return {
    showModal,
    hideModal
  }
}

import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import ModuleInfo from './ModuleInfo'
import css from './useVersionSelectionModal.module.scss'

interface ModalReturn {
  openVersionSelectionModal: () => void
  closeVersionSelectionModal: () => void
}

export const useVersionSelectionModal = (): ModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={css.dialog}>
        <ModuleInfo />
      </Dialog>
    ),
    []
  )

  return {
    openVersionSelectionModal: showModal,
    closeVersionSelectionModal: hideModal
  }
}

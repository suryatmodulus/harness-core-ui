import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { CreateDelegateWizard } from '@delegates/components/CreateDelegateWizard/CreateDelegateWizard'
import css from './useCreateDelegateModal.module.scss'

export interface UseCreateDelegateModalProps {
  onSuccess?: () => void
  onClose?: () => void
}

export interface UseCreateDelegateModalReturn {
  openDelegateModal: (modalProps?: IDialogProps) => void
  closeDelegateModal: () => void
}

const useCreateDelegateModal = (): UseCreateDelegateModalReturn => {
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    style: {
      width: 1268,
      height: 786,
      minHeight: 'auto',
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps} onClose={() => hideModal()}>
        <CreateDelegateWizard onClose={() => hideModal()} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )
  return {
    openDelegateModal: (_modalProps?: IDialogProps | undefined) => {
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    closeDelegateModal: hideModal
  }
}

export default useCreateDelegateModal

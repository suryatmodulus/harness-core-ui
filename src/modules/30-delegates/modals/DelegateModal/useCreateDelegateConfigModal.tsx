import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { CreateDelegateConfigWizard } from '@delegates/components/CreateDelegateConfigWizard/CreateDelegateConfigWizard'
import css from './useCreateDelegateModal.module.scss'

export interface UseCreateDelegateModalProps {
  onSuccess: () => void
}

export interface UseCreateDelegateModalReturn {
  openDelegateConfigModal: (modalProps?: IDialogProps) => void
  closeDelegateConfigModal: () => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1200,
    height: 640,
    minHeight: 'auto',
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}
const useCreateDelegateConfigModal = ({ onSuccess }: UseCreateDelegateModalProps): UseCreateDelegateModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps} onClose={() => hideModal()}>
        <CreateDelegateConfigWizard onClose={() => hideModal()} onSuccess={onSuccess} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )
  return {
    openDelegateConfigModal: () => {
      showModal()
    },
    closeDelegateConfigModal: hideModal
  }
}

export default useCreateDelegateConfigModal

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useModalHook } from '@wings-software/uicore'
import type { AccessPoint } from 'services/lw'
import CreateAccessPointDialogScreens from './CreateAccessPointDialogSteps'

interface UseCreateAccessPointDialogProps {
  onAccessPointSave: (ap: AccessPoint) => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

const useCreateAccessPointDialog = (props: UseCreateAccessPointDialogProps) => {
  const onAccessPointSave = (savedLb: AccessPoint) => {
    props.onAccessPointSave(savedLb)
  }
  const [createAccessPointModal, hidecreateAccessPointModal] = useModalHook(
    () => (
      <Dialog onClose={hidecreateAccessPointModal} {...modalPropsLight}>
        <CreateAccessPointDialogScreens onCancel={hidecreateAccessPointModal} onSave={onAccessPointSave} />
      </Dialog>
    ),
    []
  )
  return {
    openCreateAccessPointModal: createAccessPointModal
  }
}

export default useCreateAccessPointDialog

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button, useModalHook } from '@wings-software/uicore'
import type { AccessPoint } from 'services/lw'
import CreateAccessPointDialogScreens from './CreateAccessPointDialogSteps'

interface UseCreateAccessPointDialogProps {
  onAccessPointSave: (ap: AccessPoint) => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
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
      <Dialog onClose={hidecreateAccessPointModal} {...modalPropsLight} canOutsideClickClose={false}>
        <CreateAccessPointDialogScreens onCancel={hidecreateAccessPointModal} onSave={onAccessPointSave} />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hidecreateAccessPointModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    ),
    []
  )
  return {
    openCreateAccessPointModal: createAccessPointModal
  }
}

export default useCreateAccessPointDialog

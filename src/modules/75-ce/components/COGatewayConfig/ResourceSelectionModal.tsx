import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'

interface ResourceSelectionModalProps {
  onClose?: () => void
  closeBtnTestId?: string
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1000,
    minHeight: 350,
    borderTop: '5px solid #0091FF',
    padding: 40,
    position: 'relative',
    overflow: 'hidden'
  }
}
const ResourceSelectionModal: React.FC<ResourceSelectionModalProps> = props => {
  return (
    <Dialog {...modalProps}>
      {props.children}
      <Button
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={props.onClose}
        style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
        data-testid={props.closeBtnTestId}
      />
    </Dialog>
  )
}

export default ResourceSelectionModal

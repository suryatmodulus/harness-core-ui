import React from 'react'
import { Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'

interface FixedScheduleDialogProps {
  onClose?: () => void
}

const FixedScheduleDialog: React.FC<FixedScheduleDialogProps> = props => {
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      style={{
        width: 630,
        minHeight: 550,
        padding: 40,
        position: 'relative'
      }}
    >
      {props.children}
      <Button
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={props.onClose}
        style={{ position: 'absolute', right: 'var(--spacing-small)', top: 'var(--spacing-small)' }}
        data-testid={'scheduleDialogCloseBtn'}
      />
    </Dialog>
  )
}

export default FixedScheduleDialog

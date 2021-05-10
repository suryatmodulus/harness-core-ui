import React, { createContext, ReactElement, useState } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Icon } from '@wings-software/uicore'
import css from './DialogWithExtension.module.scss'

interface ChildrenProps {
  triggerExtension: () => void
  closeExtension: () => void
}

interface DialogWithExtensionProps {
  modalProps: IDialogProps
  dialogStyles?: { width?: number; height?: number }
  renderExtension?: ReactElement | React.FC
}

export const DialogWithExtensionContext = createContext<ChildrenProps>({
  triggerExtension: () => undefined,
  closeExtension: () => undefined
})

const DialogWithExtension: React.FC<DialogWithExtensionProps> = props => {
  const [showExtension, setShowExtension] = useState<boolean>(false)
  const triggerExtension = () => setShowExtension(true)
  const closeExtension = () => setShowExtension(false)
  return (
    <Dialog {...props.modalProps}>
      <div style={{ display: 'flex', height: props.dialogStyles?.height || 640 }}>
        <div style={{ width: props.dialogStyles?.width || 900, position: 'relative' }}>
          <DialogWithExtensionContext.Provider value={{ triggerExtension, closeExtension }}>
            {props.children}
          </DialogWithExtensionContext.Provider>
        </div>
        {showExtension && (
          <div className={css.extension}>
            {props.renderExtension}
            <span className={css.closeBtn} onClick={() => setShowExtension(false)}>
              <Icon name={'caret-left'} />
            </span>
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default DialogWithExtension

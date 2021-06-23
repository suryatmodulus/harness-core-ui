import React, { createContext, ReactElement, useState } from 'react'
import { Icon } from '@wings-software/uicore'
import Extension from './Steps/Billing/AzureConnectorBillingExtension'
import css from './CreateCeAzureConnector_new.module.scss'

export type ExtensionWindow = 'CrossAccountEx' | 'CostUsageEx' | 'BillingExport'
interface ChildrenProps {
  triggerExtension: (exWindow: ExtensionWindow) => void
  closeExtension: () => void
}

interface ExtensionProps {
  dialogStyles?: { width?: number; height?: number }
  renderExtension?: ReactElement | React.FC
}

export const DialogExtensionContext = createContext<ChildrenProps>({
  triggerExtension: () => undefined,
  closeExtension: () => undefined
})

interface SelectExtentionProps {
  exWindow: ExtensionWindow
}

const SelectExtention: React.FC<SelectExtentionProps> = props => {
  const { exWindow } = props
  switch (exWindow) {
    case 'CrossAccountEx':
      return null
    case 'CostUsageEx':
      return null
    case 'BillingExport':
      return <Extension />
  }
}

const ModalExtension: React.FC<ExtensionProps> = props => {
  const [showExtension, setShowExtension] = useState(false)
  const [exWindow, setExWindow] = useState<ExtensionWindow>('CostUsageEx')
  const triggerExtension = (ew: ExtensionWindow) => {
    setExWindow(ew)
    setShowExtension(true)
  }
  const closeExtension = () => setShowExtension(false)
  return (
    <div style={{ display: 'flex', height: props.dialogStyles?.height || 700 }}>
      <div style={{ width: props.dialogStyles?.width || 1050, position: 'relative' }}>
        <DialogExtensionContext.Provider value={{ triggerExtension, closeExtension }}>
          {props.children}
        </DialogExtensionContext.Provider>
      </div>
      {showExtension && (
        <div className={css.extension}>
          <SelectExtention exWindow={exWindow} />
          <Icon name={'chevron-left'} size={24} onClick={() => setShowExtension(false)} className={css.closeBtn} />
        </div>
      )}
    </div>
  )
}

export default ModalExtension

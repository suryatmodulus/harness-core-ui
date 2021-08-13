import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'

export interface TemplateDetailsProps {
  templateIdentifier: string | undefined
  onClose: () => void
}

export const TemplateDetailsDrawer: React.FC<TemplateDetailsProps> = props => {
  const { templateIdentifier, onClose } = props

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={600}
      isOpen={!!templateIdentifier}
      position={Position.RIGHT}
    >
      <TemplateDetails templateIdentifier={templateIdentifier} />
    </Drawer>
  )
}

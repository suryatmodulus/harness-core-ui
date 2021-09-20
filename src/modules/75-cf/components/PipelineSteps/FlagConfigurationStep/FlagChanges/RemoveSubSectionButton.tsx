import React, { FC, MouseEvent } from 'react'
import { Button, ButtonSize, ButtonVariation } from '@wings-software/uicore'

export interface RemoveSubSectionButtonProps {
  onClick: () => void
}

const RemoveSubSectionButton: FC<RemoveSubSectionButtonProps> = ({ onClick }) => (
  <Button
    minimal
    size={ButtonSize.SMALL}
    onClick={(e: MouseEvent) => {
      e.preventDefault()
      onClick()
    }}
    variation={ButtonVariation.ICON}
    icon="trash"
    data-testid="flagChanges-removeSubSection"
  />
)

export default RemoveSubSectionButton

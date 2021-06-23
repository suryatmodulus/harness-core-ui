import React, { useState } from 'react'
import { Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Popover } from '@blueprintjs/core'
import { Color, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import css from './CopyToClipBoard.module.scss'

interface CopyToClipboardProps {
  content: string
  showFeedback?: boolean
  iconSize?: number
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = props => {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const { getString } = useStrings()
  const getPopoverContent = (): JSX.Element => {
    return (
      <div className={css.popoverContent}>
        {props.showFeedback && isCopied ? (
          <Icon name="command-artifact-check" color={Color.GREEN_450} />
        ) : (
          <span className={css.tooltipLabel}>{getString('snippets.copyToClipboard')} </span>
        )}
      </div>
    )
  }
  return (
    <>
      <Popover
        minimal
        position={Position.BOTTOM}
        interactionKind={PopoverInteractionKind.HOVER}
        content={getPopoverContent()}
        onOpening={() => {
          if (props.showFeedback) {
            setIsCopied(false)
          }
        }}
      >
        <div>
          <Icon
            name="copy-alt"
            size={props.iconSize ?? 20}
            onClick={async (event: React.MouseEvent<HTMLHeadingElement, globalThis.MouseEvent>) => {
              event.preventDefault()
              event.stopPropagation()
              navigator?.clipboard?.writeText(props?.content)
              setIsCopied(true)
            }}
            className={css.copyIcon}
          />
        </div>
      </Popover>
    </>
  )
}

export default CopyToClipboard

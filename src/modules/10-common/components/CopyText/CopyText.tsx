import React from 'react'
import { Button, Utils, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { Classes } from '@blueprintjs/core'
import { String } from 'framework/strings'
import css from './CopyText.module.scss'

export interface CopyTextProps {
  children?: React.ReactNode
  iconName?: IconName
  className?: string
  valueClassName?: string
  textToCopy: string
  iconAlwaysVisible?: boolean
}

export function CopyText(props: CopyTextProps): React.ReactElement {
  const { iconAlwaysVisible = false } = props
  const [copied, setCopied] = React.useState(false)
  const icon = props.iconName || 'copy-alt'
  function handleClick(): void {
    Utils.copy(props.textToCopy)
    setCopied(true)
  }

  function onClosed(): void {
    setCopied(false)
  }

  return (
    <div className={cx(css.main, props.className)}>
      <div className={cx(css.text, props.valueClassName)}>{props.children}</div>
      {window.isSecureContext && (
        <Button
          data-testid="copy-btn"
          disabled={!window.isSecureContext}
          data-name={icon}
          icon={copied ? 'execution-success' : icon}
          minimal
          intent="primary"
          small
          className={cx(css.copyIcon, copied && css.successIcon)}
          tooltip={<String className={css.tooltip} stringID={copied ? 'copiedToClipboard' : 'clickToCopy'} />}
          tooltipProps={{
            wrapperTagName: 'div',
            className: iconAlwaysVisible ? cx(css.alwaysVisible, Classes.DARK) : css.btnWrapper,
            onClosed
          }}
          onClick={handleClick}
        />
      )}
    </div>
  )
}

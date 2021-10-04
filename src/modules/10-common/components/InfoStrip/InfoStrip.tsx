import React from 'react'
import cx from 'classnames'
import { Icon, IconName, Intent } from '@wings-software/uicore'
import css from './InfoStrip.module.scss'
interface InfoStripProps {
  intent: Intent
  className?: string
  content: string | React.ReactElement
}
const INTENT_TO_CLASS_MAP: { [key: string]: string } = {
  [Intent.PRIMARY]: css.primary,
  [Intent.WARNING]: css.warning,
  [Intent.DANGER]: css.danger
}
const INTENT_TO_ICON_MAP: { [key: string]: IconName } = {
  [Intent.PRIMARY]: 'info-sign',
  [Intent.WARNING]: 'warning-sign',
  [Intent.DANGER]: 'warning-sign'
}
const InfoStrip = (props: InfoStripProps): React.ReactElement => {
  return (
    <div className={cx(css.infoStrip, INTENT_TO_CLASS_MAP[props.intent], props.className)}>
      <Icon intent={props.intent} inline name={INTENT_TO_ICON_MAP[props.intent]} className={css.iconStyle} />
      {<span>{props.content}</span>}
    </div>
  )
}
export default InfoStrip

import * as React from 'react'
import { Color, Icon } from '@wings-software/uicore'
import cx from 'classnames'

import css from './Ticker.module.scss'

export enum TickerVerticalAlignment {
  TOP = 'TickerVerticalAlignment.TOP',
  CENTER = 'TickerVerticalAlignment.CENTER',
  BOTTOM = 'TickerVerticalAlignment.BOTTOM'
}

export interface TickerProps {
  decreaseMode?: boolean
  color?: string
  leftAlign?: boolean
  tickerRightAligned?: boolean
  value: string | React.ReactElement
  verticalAlign?: TickerVerticalAlignment
  size?: number
}

export const Ticker: React.FC<TickerProps> = props => {
  const {
    decreaseMode = false,
    leftAlign = false,
    tickerRightAligned = false,
    verticalAlign = TickerVerticalAlignment.BOTTOM,
    color = Color.GREEN_500,
    size = 6,
    value,
    children
  } = props
  const iconName = decreaseMode ? 'main-caret-down' : 'main-caret-up'
  return (
    <div className={cx(css.tickerContainer, { [css.reverseAlignment]: leftAlign })}>
      {children ? <>{children}</> : <></>}
      <div
        className={cx(
          css.ticker,
          { [css.tickerTopAlign]: verticalAlign === TickerVerticalAlignment.TOP },
          { [css.tickerCenterAlign]: verticalAlign === TickerVerticalAlignment.CENTER },
          { [css.tickerReverseAlignment]: tickerRightAligned }
        )}
      >
        <div className={css.iconContainer}>
          <Icon name={iconName} color={color} size={size} />
        </div>
        <div className={css.tickerValue}>{value}</div>
      </div>
    </div>
  )
}

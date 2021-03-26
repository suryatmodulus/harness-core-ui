import React from 'react'
import classNames from 'classnames'
import { Spinner } from '@blueprintjs/core'
import { String } from 'framework/exports'
import css from './components.module.scss'
export interface BarrierStageTooltipProps {
  loading: boolean
  data?: any
  stageName: string
}

export default function BarrierStageTooltip(props: BarrierStageTooltipProps): React.ReactElement {
  return props.loading ? (
    <div className={css.spinner}>
      <Spinner size={40} />
    </div>
  ) : (
    <div className={css.barrierList}>
      {props?.data.map((barrier: any) => (
        <div className={css.barrierRow} key={barrier.identifier}>
          <div className={classNames(css.timeoutRow, css.row)}>
            <div>{barrier?.timeoutIn ? barrier?.timeoutIn / 1000 / 60 : ''}</div>
            <div className={css.subheading}>min</div>
          </div>
          <div className={css.row}>
            <div className={css.barriername}>{barrier.name}</div>
            <div className={css.subheading}>{barrier.identifier}</div>
          </div>
          <div className={classNames(css.row, css.stageName)}>
            <div></div>
            <div className={css.subheading}>
              <String stringID="stage" />
              {props?.stageName}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

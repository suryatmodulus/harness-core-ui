import React from 'react'
import { Icon, timeToDisplayText, Text } from '@wings-software/uicore'
import { ExecutionStatusLabel } from '@pipeline/exports'
import { ExecutionPipelineItemStatus } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import css from './HoverCard.module.scss'
export interface HoverCardProps {
  data?: any
  barrier?: {
    barrierInfoLoading?: boolean
    barrierData?: any
  }
  children?: any
}

export default function HoverCard(props: HoverCardProps): React.ReactElement {
  const { data } = props
  let delta = data?.data?.startTs ? Math.abs(data?.data?.startTs - (data?.data?.endTs || Date.now())) : 0
  delta = Math.round(delta / 1000) * 1000
  const timeText = timeToDisplayText(delta)
  return (
    <div className={css.hovercard}>
      <div className={css.header}>
        <div className={css.title}>
          <div>{data.name}</div>
          {data.status === ExecutionPipelineItemStatus.FAILED && (
            <div className={css.failureMessage}>
              <Icon name="warning-sign" className={css.warningIcon} />
              <Text
                title={data?.data?.failureInfo?.message || data?.data?.failureInfo?.errorMessage}
                width={150}
                lineClamp={2}
              >
                {data?.data?.failureInfo?.message || data?.data?.failureInfo?.errorMessage}
              </Text>
            </div>
          )}
        </div>
        <div className={css.status}>
          <ExecutionStatusLabel status={data?.status} className={css.statusLabel} />
          {data.status !== ExecutionPipelineItemStatus.SKIPPED && (
            <div className={css.timeElapsed}>
              <Icon name="time" size={14} />
              <div className={css.time}>{timeText}</div>
            </div>
          )}
        </div>
      </div>
      {props?.children}
    </div>
  )
}

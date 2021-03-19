import React, { useEffect, useState } from 'react'
import { Text, TextProps, timeToDisplayText } from '@wings-software/uicore'
import { isNil } from 'lodash-es'
import { useStrings } from 'framework/exports'

export interface DurationProps extends Omit<TextProps, 'icon'> {
  startTime?: number
  endTime?: number // if endTime is nullable, endTime is Date.now() and the duration is re-calculated by an interval
  durationText?: string // optional text to override the default `Duration: ` prefix
  showMilliSeconds?: boolean
  icon?: TextProps['icon'] | null
}

export function Duration(props: DurationProps): React.ReactElement {
  const { startTime, endTime, durationText, icon, showMilliSeconds, ...textProps } = props
  const [_endTime, setEndTime] = useState(endTime || Date.now())
  const { getString } = useStrings()

  useEffect(() => {
    if (endTime) {
      setEndTime(endTime)
    }

    const timeoutId =
      (!endTime &&
        window.setInterval(() => {
          setEndTime(Date.now())
        }, 1000)) ||
      0

    return () => {
      window.clearInterval(timeoutId)
    }
  }, [endTime])

  let delta = startTime ? Math.abs(startTime - _endTime) : 0

  if (!showMilliSeconds) {
    delta = Math.round(delta / 1000) * 1000
  }

  const text = timeToDisplayText(delta)

  return (
    <Text inline icon={isNil(icon) ? undefined : icon || 'hourglass'} {...textProps}>
      {durationText ?? getString('common.durationPrefix')}
      {text}
    </Text>
  )
}

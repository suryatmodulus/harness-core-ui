import React, { useEffect, useState } from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import CVProgressBar from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/CVProgressBar/CVProgressBar'
import type { ActivityVerificationSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './ActivityProgressIndicator.module.scss'

interface ActivityProgressIndicatorProps {
  data?: ActivityVerificationSummary | null
  className?: string
  onClick?(e: React.MouseEvent<HTMLElement>): void
}

const SMALL_FONT_SIZE = {
  fontSize: 12
}

export default function ActivityProgressIndicator(props: ActivityProgressIndicatorProps): JSX.Element {
  const {
    progressPercentage: progress,
    total,
    progress: progressCount,
    passed,
    remainingTimeMs,
    startTime,
    durationMs,
    aggregatedStatus
  } = props.data || {}
  const notStarted = !props.data || aggregatedStatus === 'NOT_STARTED'
  const isInProgress = props.data && aggregatedStatus === 'IN_PROGRESS'
  const [progressValue, setProgressValue] = useState(isInProgress ? 0 : 100)
  const { getString } = useStrings()
  useEffect(() => {
    if (isInProgress) {
      const timeoutRefNumber = setTimeout(() => {
        setProgressValue(Math.min(100, Math.max(0, progress!)))
        clearTimeout(timeoutRefNumber)
      }, 250)
    }
  }, [props.data])

  if (notStarted) {
    return (
      <Container className={cx(props.className, css.notStarted)}>
        <Text style={SMALL_FONT_SIZE}>{getString('cv.dashboard.notStarted')}</Text>
        <CVProgressBar />
      </Container>
    )
  }

  const minutesRemaining = Math.floor((remainingTimeMs ?? 0) / 1000 / 60)
  const duration = Math.floor((durationMs ?? 0) / 1000 / 60)

  let progressDescription: string

  if (isInProgress) {
    progressDescription = `${getString('inProgress').toLocaleLowerCase()} (${minutesRemaining} ${getString(
      'cv.activityChanges.minutesRemaining'
    ).toLocaleLowerCase()})`
    if (progressCount! > 1) {
      progressDescription = `${progressCount}/${total} ${getString(
        'cv.verifications'
      ).toLocaleLowerCase()} ${progressDescription}`
    }
  } else {
    progressDescription = `${passed}/${total} ${getString('cv.verifications').toLocaleLowerCase()} ${getString(
      'passed'
    ).toLocaleLowerCase()}`
  }

  return (
    <Container className={props.className} onClick={props.onClick}>
      <Text color={progress === 100 ? undefined : Color.BLACK} style={SMALL_FONT_SIZE}>
        {progressDescription}
      </Text>
      <CVProgressBar status={aggregatedStatus} value={progressValue} />
      <Container flex>
        {startTime !== undefined && startTime !== null && (
          <Text color={Color.GREY_400} style={SMALL_FONT_SIZE}>{`${getString('pipeline.startedOn')} ${new Date(
            startTime
          ).toLocaleString()}`}</Text>
        )}
        {duration !== undefined && duration !== null && (
          <Text color={Color.GREY_400} style={SMALL_FONT_SIZE}>{`${duration} ${getString('timeMinutes')}`}</Text>
        )}
      </Container>
    </Container>
  )
}

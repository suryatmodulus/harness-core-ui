import React from 'react'
import { Container } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import classnames from 'classnames'
import { isNumber } from 'lodash-es'
import { getColorStyle } from '@common/components/HeatMap/ColorUtils'
import type { ActivityVerificationSummary } from 'services/cv'
import styles from './CVProgressBar.module.scss'

export interface CVProgressBarProps {
  status?: ActivityVerificationSummary['aggregatedStatus']
  value?: number
  riskScore?: number
  className?: string
}

function statusToIntent(status: CVProgressBarProps['status']): string {
  switch (status) {
    case 'ERROR':
    case 'VERIFICATION_FAILED':
      return Classes.INTENT_DANGER
    case 'IN_PROGRESS':
      return Classes.INTENT_PRIMARY
    case 'NOT_STARTED':
      return ''
    case 'VERIFICATION_PASSED':
      return Classes.INTENT_SUCCESS
    default:
      return ''
  }
}

export default function CVProgressBar(props: CVProgressBarProps): JSX.Element {
  const { status, className, riskScore, value } = props
  return (
    <Container
      className={classnames(
        Classes.PROGRESS_BAR,
        styles.progressBar,
        status ? statusToIntent(status) : undefined,
        className
      )}
    >
      <Container
        className={classnames(
          Classes.PROGRESS_METER,
          isNumber(riskScore) ? getColorStyle(riskScore, 0, 100) : undefined
        )}
        style={{ width: `${value}%` }}
      />
    </Container>
  )
}

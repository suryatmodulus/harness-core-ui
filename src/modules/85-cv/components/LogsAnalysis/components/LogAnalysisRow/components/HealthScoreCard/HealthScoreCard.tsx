import React from 'react'
import { Text, Layout } from '@wings-software/uicore'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { RiskData } from 'services/cv'
import css from './HealthScoreCard.module.scss'

interface HealthScoreCardProps {
  riskScore: number
  riskStatus: RiskData['riskStatus']
}

// Not used
export const HealthScoreCard = (props: HealthScoreCardProps): JSX.Element => {
  const { riskScore, riskStatus } = props
  if (riskScore || riskScore === 0) {
    const color = getRiskColorValue(riskStatus)
    return (
      <Layout.Horizontal
        style={{ flexDirection: 'column' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <div className={css.healthScoreCard} style={{ background: color }}>
          {riskScore}
        </div>
        <Text padding={{ right: 'small', top: 'small' }} font={'xsmall'}>
          {riskStatus}
        </Text>
      </Layout.Horizontal>
    )
  }
  return <></>
}

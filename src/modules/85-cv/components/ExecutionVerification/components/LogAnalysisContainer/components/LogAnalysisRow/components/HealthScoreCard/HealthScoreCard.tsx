import React from 'react'
import { Text, Layout } from '@wings-software/uicore'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import css from './HealthScoreCard.module.scss'

interface HealthScoreCardProps {
  riskScore: number
  riskStatus: string
}

export const HealthScoreCard = (props: HealthScoreCardProps): JSX.Element => {
  const { riskScore, riskStatus } = props
  if (riskScore || riskScore === 0) {
    const color = getRiskColorValue(riskStatus)
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <div className={css.healthScoreCard} style={{ background: color }}>
          {riskScore}
        </div>
        <Text font={'xsmall'}>{riskStatus}</Text>
      </Layout.Horizontal>
    )
  }
  return <></>
}

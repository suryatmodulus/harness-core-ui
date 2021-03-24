import { Card, Layout, Text } from '@wings-software/uicore'
import React from 'react'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string
  subTitle: string
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, subTitle } = props

  return (
    <Card className={css.savingsCard}>
      <Layout.Vertical spacing="small">
        <Text font="normal">{title}</Text>
        <Text className={css.amount} color="grey800">
          {amount}
        </Text>
        <Text font="small">{subTitle}</Text>
      </Layout.Vertical>
    </Card>
  )
}

export default RecommendationSavingsCard

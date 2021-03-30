import { Card, Layout, Text, IconName } from '@wings-software/uicore'
import React from 'react'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string
  subTitle: string
  iconName?: IconName
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, subTitle, iconName } = props

  return (
    <Card className={css.savingsCard}>
      <Layout.Vertical spacing="small">
        <Text font="normal">{title}</Text>
        <Text className={css.amount} color="grey800" icon={iconName ? iconName : undefined} iconProps={{ size: 28 }}>
          {amount}
        </Text>
        <Text font="small">{subTitle}</Text>
      </Layout.Vertical>
    </Card>
  )
}

export default RecommendationSavingsCard

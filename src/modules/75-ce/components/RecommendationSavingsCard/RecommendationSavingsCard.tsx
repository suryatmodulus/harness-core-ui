/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, IconName } from '@wings-software/uicore'
import React from 'react'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string
  subTitle?: string
  iconName?: IconName
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, subTitle, iconName } = props

  return (
    <Card className={css.savingsCard} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text font="normal" color="grey400">
          {title}
        </Text>
        <Text
          className={css.amount}
          color={iconName ? 'green500' : 'grey800'}
          icon={iconName ? iconName : undefined}
          iconProps={{ size: 28 }}
        >
          {amount}
        </Text>
        {subTitle ? <Text font="small">{subTitle}</Text> : null}
      </Layout.Vertical>
    </Card>
  )
}

export default RecommendationSavingsCard

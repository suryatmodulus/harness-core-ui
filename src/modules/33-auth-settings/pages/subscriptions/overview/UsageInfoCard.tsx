/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Color, Layout, Text } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import PercentageBar from './PercentageBar'
import css from './SubscriptionUsageCard.module.scss'

function getInfoIcon(tooltip: string): React.ReactElement {
  return (
    <Text
      icon="deployment-incomplete-legacy"
      iconProps={{ size: 15 }}
      tooltip={tooltip}
      tooltipProps={{ isDark: true, position: Position.BOTTOM }}
    />
  )
}

interface PercentageBarReturn {
  width: number
  color: Color
  percentage: number
  overPercentage?: number
}

function getPercentageBarProps(dividend?: number, divisor?: number): PercentageBarReturn {
  let width = 0,
    color = Color.PRIMARY_6,
    percentage = 0,
    overPercentage = undefined
  if (divisor && divisor > 0 && dividend && dividend >= 0) {
    percentage = (dividend * 100) / divisor
    width = percentage > 100 ? 100 : percentage
    color = percentage >= 90 ? Color.ORANGE_500 : color
    const isOverSubscribed = percentage > 100
    if (isOverSubscribed) {
      overPercentage = Math.round(percentage - 100)
    }
    percentage = Math.round(percentage)
  }
  return { width, color, percentage, overPercentage }
}

const PercentageSubscribedLabel: React.FC<{
  overPercentage?: number
  percentage: number
  color: string
  label: string
}> = ({ overPercentage, percentage, color, label }) => {
  const { getString } = useStrings()
  if (overPercentage) {
    return (
      <Text font={{ size: 'xsmall' }} color={color}>
        {overPercentage}% {getString('common.overSubscribed')}
      </Text>
    )
  }
  return (
    <Text font={{ size: 'xsmall' }} color={percentage > 90 ? Color.ORANGE_500 : ''}>
      {percentage}% {label}
    </Text>
  )
}

interface UsageInfoCardProps {
  subscribed?: number
  usage: number
  leftHeader: string
  tooltip: string
  rightHeader?: string
  hasBar: boolean
  leftFooter?: string
  rightFooter?: string
  prefix?: string
}

const UsageInfoCard: React.FC<UsageInfoCardProps> = ({
  subscribed,
  usage,
  leftHeader,
  tooltip,
  rightHeader,
  hasBar,
  leftFooter,
  rightFooter,
  prefix
}) => {
  const { overPercentage, percentage, width, color } = getPercentageBarProps(usage, subscribed)

  const { getString } = useStrings()

  function getLabel(value: number | undefined): string | number | undefined {
    if (value && value >= 1000000) {
      let roundValue = Math.round(value / 10000)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}M`
    }
    if (value && value >= 1000) {
      let roundValue = Math.round(value / 10)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}K`
    }
    if (value === -1) {
      return getString('common.unlimited')
    }
    return value
  }

  return (
    <Card className={css.innerCard}>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Layout.Horizontal spacing="xsmall">
            <Text font={{ size: 'small' }}>{leftHeader}</Text>
            {getInfoIcon(tooltip)}
          </Layout.Horizontal>
          <Text font={{ size: 'xsmall' }}>{rightHeader}</Text>
        </Layout.Horizontal>
        <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
          {prefix}
          {getLabel(usage)}
        </Text>
        {hasBar && <PercentageBar width={width} />}
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ size: 'xsmall' }}>
            {getLabel(subscribed)} {leftFooter}
          </Text>
          {rightFooter && (
            <PercentageSubscribedLabel
              overPercentage={overPercentage}
              percentage={percentage}
              color={color}
              label={rightFooter}
            />
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}

export default UsageInfoCard

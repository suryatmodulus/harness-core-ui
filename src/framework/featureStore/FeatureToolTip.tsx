import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Color, Layout, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from './FeatureToolTip.module.scss'

interface Props {
  featureName: string
  enabled: boolean
  limit?: number
  count?: number
  apiFail?: boolean
  module?: Module
}

const FeatureTooltip: React.FC<Props> = ({ featureName, enabled, limit, count, apiFail, module }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  if (apiFail) {
    return <Text>{getString('common.feature.apiFail', { featureName: featureName })}</Text>
  }

  if (enabled) {
    return <div></div>
  }

  if (limit || count) {
    return (
      <Layout.Vertical padding="small" spacing="small">
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800}>
          {getString('common.feature.overCap.title')}
        </Text>
        <Text className={css.textToLowercase}>{getString('common.feature.overCap.limit', { limit: limit })}</Text>
        <Text className={css.textToLowercase}>{getString('common.feature.overCap.count', { count: count })}</Text>
        <Link to={routes.toSubscriptions({ accountId, moduleCard: module })}>
          {getString('common.feature.comparePlans')}
        </Link>
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding="small" spacing="small">
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800}>
        {getString('common.plans.featureComparison.disabled', { featureName: featureName })}
      </Text>
      <Link to={routes.toSubscriptions({ accountId, moduleCard: module })}>
        {getString('common.feature.comparePlans')}
      </Link>
    </Layout.Vertical>
  )
}

export default FeatureTooltip

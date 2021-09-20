import React from 'react'
import { useParams, Link } from 'react-router-dom'
import cx from 'classnames'
import { Color, Layout, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

export interface FeatureTooltipProps {
  featureName: string
  limit?: number
  count?: number
  apiFail?: boolean
  module?: Module
  className?: string
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({ featureName, limit, count, apiFail, module, className }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  if (apiFail) {
    return (
      <Layout.Vertical padding="small" spacing="small" className={cx('api-fail', className)}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {getString('common.feature.apiFail', { featureName: featureName })}
        </Text>
      </Layout.Vertical>
    )
  }

  if (limit || count) {
    return (
      <Layout.Vertical padding="small" spacing="small" className={cx('over-cap', className)}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {getString('common.feature.overCap.title')}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('common.feature.overCap.limit', { limit: limit })}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('common.feature.overCap.count', { count: count })}
        </Text>
        <Link to={routes.toSubscriptions({ accountId, moduleCard: module })}>
          {getString('common.feature.comparePlans')}
        </Link>
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding="small" spacing="small" className={cx('disabled', className)}>
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('common.feature.disabled', { featureName: featureName })}
      </Text>
      <Link to={routes.toSubscriptions({ accountId, moduleCard: module })}>
        {getString('common.feature.comparePlans')}
      </Link>
    </Layout.Vertical>
  )
}

export default FeatureTooltip

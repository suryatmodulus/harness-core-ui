import React from 'react'
import { useParams, Link } from 'react-router-dom'
import cx from 'classnames'
import { Color, Layout, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

interface Props {
  featureName: string
  enabled: boolean
  limit?: number
  count?: number
  apiFail?: boolean
  module?: Module
  className?: string
}

const FeatureTooltip: React.FC<Props> = ({ featureName, enabled, limit, count, apiFail, module, className }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  if (apiFail) {
    return (
      <Text className={cx('api-fail', className)} font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('common.feature.apiFail', { featureName: featureName })}
      </Text>
    )
  }

  if (enabled) {
    return <div></div>
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

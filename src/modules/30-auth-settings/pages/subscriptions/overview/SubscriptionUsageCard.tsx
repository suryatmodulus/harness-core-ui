import React from 'react'

import { Card, Color, Heading, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import CIUsageInfo from './CIUsageInfo'
import FFUsageInfo from './FFUsageInfo'
import css from '../SubscriptionsPage.module.scss'

interface SubscriptionUsageProps {
  module: ModuleName
}

const getModuleUsages = (props: SubscriptionUsageProps): React.ReactElement | undefined => {
  switch (props.module) {
    case ModuleName.CI:
      return <CIUsageInfo />
    case ModuleName.CF:
      return <FFUsageInfo />
    default:
      return undefined
  }
}

const SubscriptionUsageCard: React.FC<SubscriptionUsageProps> = props => {
  const { getString } = useStrings()
  const usageModule = getModuleUsages(props)
  return usageModule ? (
    <Card className={css.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.usage.header')}
        </Heading>
        {usageModule}
      </Layout.Vertical>
    </Card>
  ) : (
    <></>
  )
}

export default SubscriptionUsageCard

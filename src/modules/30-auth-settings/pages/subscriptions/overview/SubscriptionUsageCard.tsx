import React from 'react'

import { Card, Color, Heading, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import CDUsageInfo, { CDUsageInfoProps } from './CDUsageInfo'
import CIUsageInfo, { CIUsageInfoProps } from './CIUsageInfo'
import FFUsageInfo, { FFUsageInfoProps } from './FFUsageInfo'
import CCMUsageInfo, { CCMUsageInfoProps } from './CCMUsageInfo'
import css from '../SubscriptionsPage.module.scss'

interface SubscriptionUsageProps {
  module: ModuleName
  cdUsageInfoProps?: CDUsageInfoProps
  ciUsageInfoProps?: CIUsageInfoProps
  ffUsageInfoProps?: FFUsageInfoProps
  ccmUsageInfoProps?: CCMUsageInfoProps
}

const getModuleUsages = (props: SubscriptionUsageProps): React.ReactElement | undefined => {
  switch (props.module) {
    case ModuleName.CD:
      return props.cdUsageInfoProps && <CDUsageInfo {...props.cdUsageInfoProps} />
    case ModuleName.CI:
      return props.ciUsageInfoProps && <CIUsageInfo {...props.ciUsageInfoProps} />
    case ModuleName.CF:
      return props.ffUsageInfoProps && <FFUsageInfo {...props.ffUsageInfoProps} />
    case ModuleName.CE:
      return props.ccmUsageInfoProps && <CCMUsageInfo {...props.ccmUsageInfoProps} />
    default:
      return <div></div>
  }
}

const SubscriptionUsageCard: React.FC<SubscriptionUsageProps> = props => {
  const { getString } = useStrings()
  return (
    <Card className={css.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.usage.header')}
        </Heading>
        {getModuleUsages(props)}
      </Layout.Vertical>
    </Card>
  )
}

export default SubscriptionUsageCard

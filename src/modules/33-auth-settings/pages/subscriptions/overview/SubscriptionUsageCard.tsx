/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Card, Color, Heading, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import CCMUsageInfo from '@auth-settings/pages/subscriptions/overview/CCMUsageInfo'
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
    case ModuleName.CE:
      return <CCMUsageInfo />
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

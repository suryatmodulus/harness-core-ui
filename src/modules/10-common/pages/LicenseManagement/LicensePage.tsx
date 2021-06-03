import React, { useState } from 'react'
import { Layout, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { SubscriptionPage } from './Subscription/SubscriptionPage'
import { PlansPage } from './Plans/PlansPage'
import { BillingPage } from './Billing/BillingPage'
import css from './LicensePage.module.scss'

export enum TAB {
  SUBSCRIPTION,
  PLANS,
  BILLING
}

interface LicensePageProps {
  initialTab?: TAB
}

const LicenseHeader = ({ tab, setTab }: { tab: TAB; setTab: (tab: TAB) => void }): React.ReactElement => {
  const { getString } = useStrings()

  const getHeaderDescription = (): string => {
    switch (tab) {
      case TAB.SUBSCRIPTION:
        return getString('common.license.subscriptions.description')
      case TAB.PLANS:
        return getString('common.license.plans.description')
      case TAB.BILLING:
        return getString('common.license.billing.description')
    }
  }

  const ToolBar = (): React.ReactElement => {
    return (
      <Layout.Horizontal spacing="large">
        <Text
          padding={'small'}
          color={Color.PRIMARY_7}
          className={cx(css.tabTitle, tab === TAB.SUBSCRIPTION ? css.selected : undefined)}
          onClick={() => setTab(TAB.SUBSCRIPTION)}
        >
          {getString('common.license.subscriptions.title')}
        </Text>
        <Text
          padding={'small'}
          color={Color.PRIMARY_7}
          className={cx(css.tabTitle, tab === TAB.PLANS ? css.selected : undefined)}
          onClick={() => setTab(TAB.PLANS)}
        >
          {getString('common.license.plans.title')}
        </Text>
        <Text
          padding={'small'}
          color={Color.PRIMARY_7}
          className={cx(css.tabTitle, tab === TAB.BILLING ? css.selected : undefined)}
          onClick={() => setTab(TAB.BILLING)}
        >
          {getString('common.license.billing.title')}
        </Text>
      </Layout.Horizontal>
    )
  }

  return <Page.Header title={getHeaderDescription()} toolbar={<ToolBar />} />
}

const getLicenseBody = (tab: TAB): React.ReactElement => {
  switch (tab) {
    case TAB.SUBSCRIPTION:
      return <SubscriptionPage />
    case TAB.PLANS:
      return <PlansPage />
    case TAB.BILLING:
      return <BillingPage />
  }
}

export const LicensePage: React.FC<LicensePageProps> = ({ initialTab = TAB.SUBSCRIPTION }) => {
  const [tab, setTab] = useState<TAB>(initialTab)

  return (
    <>
      <LicenseHeader tab={tab} setTab={setTab} />
      {getLicenseBody(tab)}
    </>
  )
}

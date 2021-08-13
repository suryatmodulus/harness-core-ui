import type { StringsMap } from 'stringTypes'

export enum SUBSCRIPTION_TAB_NAMES {
  OVERVIEW,
  PLANS,
  BILLING
}
export interface SubscriptionTab {
  name: SUBSCRIPTION_TAB_NAMES
  label: keyof StringsMap
}

export const SUBSCRIPTION_TABS: SubscriptionTab[] = [
  {
    name: SUBSCRIPTION_TAB_NAMES.OVERVIEW,
    label: 'common.subscriptions.tabs.overview'
  },
  {
    name: SUBSCRIPTION_TAB_NAMES.PLANS,
    label: 'common.subscriptions.tabs.plans'
  }
  // {
  //   name: SUBSCRIPTION_TAB_NAMES.BILLING,
  //   label: 'common.subscriptions.tabs.billing'
  // }
]

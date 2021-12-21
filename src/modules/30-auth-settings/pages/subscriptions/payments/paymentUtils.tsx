import React from 'react'
import { capitalize } from 'lodash-es'
import { Text, IconName, FontVariation } from '@wings-software/uicore'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { PLAN_UNIT, LOOKUP_KEYS, Editions } from '@common/constants/SubscriptionTypes'
import type { PriceDTO, TiersDTO } from 'services/cd-ng'

export function getIcon(moduleName: ModuleName): string | undefined {
  switch (moduleName) {
    case ModuleName.CD:
      return 'cd-main'
    case ModuleName.CE:
      return 'ce-main'
    case ModuleName.CF:
      return 'cf-main'
    case ModuleName.CI:
      return 'ci-main'
  }
  return undefined
}

export interface HeaderProps {
  moduleName: ModuleName
  subscribePlan?: Editions
}

export const Header = ({ moduleName, subscribePlan }: HeaderProps): JSX.Element => {
  const icon = getIcon(moduleName)
  const { getString } = useStrings()
  const subscriptionStr = getString('common.subscription')
  const header = `${moduleName} ${capitalize(subscribePlan)} ${subscriptionStr}`

  return icon ? (
    <Text icon={icon as IconName} iconProps={{ size: 25 }} font={{ variation: FontVariation.H4 }}>
      {header}
    </Text>
  ) : (
    <></>
  )
}

function getTierPrice(services: number, tierPrices?: TiersDTO[]): { count: number; price: number }[] {
  const prices: { count: number; price: number }[] = []
  let count = services
  tierPrices?.map(tierPrice => {
    const { upTo, unitAmount } = tierPrice
    if (count > 0) {
      if (upTo && upTo < count) {
        prices.push({ count: upTo, price: (unitAmount || 0) / 100 })
        count = count - upTo
      } else {
        prices.push({ count, price: (unitAmount || 0) / 100 })
        count = 0
      }
    }
  })
  return prices
}

export function getPrices(
  unit: PLAN_UNIT,
  edition: Editions,
  moduleName: ModuleName,
  services: number,
  productPrices?: PriceDTO[]
): {
  unitPrices: { count: number; price: number }[]
  supportPrice?: number
  priceId?: string
  lookupKey?: LOOKUP_KEYS
  supportPriceId?: string
  supportLookupKey?: LOOKUP_KEYS
} {
  let unitPrices: { count: number; price: number }[] = [],
    supportPrice,
    priceId,
    lookupKey,
    supportPriceId,
    supportLookupKey

  const key = `${moduleName}_${edition}_${unit}`

  switch (key) {
    case 'CD_ENTERPRISE_MONTHLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_MONTHLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_MONTHLY)?.priceId
      lookupKey = LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_MONTHLY
      supportPrice = productPrices?.find(
        price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_MONTHLY
      )?.unitAmount
      supportPriceId = productPrices?.find(
        price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_MONTHLY
      )?.priceId
      supportLookupKey = LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_MONTHLY
      break
    case 'CD_ENTERPRISE_YEARLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_YEARLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_YEARLY)?.priceId
      lookupKey = LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_YEARLY
      supportPrice = productPrices?.find(
        price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_YEARLY
      )?.unitAmount
      supportPriceId = productPrices?.find(
        price => price.lookupKey === LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_YEARLY
      )?.priceId
      supportLookupKey = LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_YEARLY
      break
    case 'CI_ENTERPRISE_MONTHLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_MONTHLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_MONTHLY)?.priceId
      lookupKey = LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_MONTHLY
      break
    case 'CI_ENTERPRISE_YEARLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_YEARLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_YEARLY)?.priceId
      lookupKey = LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_YEARLY
      break
    case 'CI_TEAM_MONTHLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_TEAM_DEVELOPERS_MONTHLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_TEAM_DEVELOPERS_MONTHLY)?.priceId
      lookupKey = LOOKUP_KEYS.CI_TEAM_DEVELOPERS_MONTHLY
      break
    case 'CI_TEAM_YEARLY':
      unitPrices = getTierPrice(
        services,
        productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_TEAM_DEVELOPERS_YEARLY)?.tiersDTO
      )
      priceId = productPrices?.find(price => price.lookupKey === LOOKUP_KEYS.CI_TEAM_DEVELOPERS_YEARLY)?.priceId
      lookupKey = LOOKUP_KEYS.CI_TEAM_DEVELOPERS_YEARLY
      break
  }
  return {
    unitPrices,
    supportPrice,
    priceId,
    lookupKey,
    supportPriceId,
    supportLookupKey
  }
}

export function getLookupKeys(moduleName: string): LOOKUP_KEYS[] {
  const defaultKeys: LOOKUP_KEYS[] = []
  switch (moduleName) {
    case ModuleName.CD:
      return [
        LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_MONTHLY,
        LOOKUP_KEYS.CD_ENTERPRISE_PREMIUM_SUPPORT_YEARLY,
        LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_MONTHLY,
        LOOKUP_KEYS.CD_ENTERPRISE_SERVICE_YEARLY
      ]
    case ModuleName.CI:
      return [
        LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_MONTHLY,
        LOOKUP_KEYS.CI_ENTERPRISE_DEVELOPERS_YEARLY,
        LOOKUP_KEYS.CI_TEAM_DEVELOPERS_MONTHLY,
        LOOKUP_KEYS.CI_TEAM_DEVELOPERS_YEARLY
      ]

    case ModuleName.CF:
    case ModuleName.CE:
  }

  return defaultKeys
}

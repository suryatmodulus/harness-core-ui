import React from 'react'
import { capitalize } from 'lodash-es'
import { Text, IconName, FontVariation } from '@wings-software/uicore'
import { ModuleName } from 'framework/types/ModuleName'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'

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
  subscribePlan: Editions
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

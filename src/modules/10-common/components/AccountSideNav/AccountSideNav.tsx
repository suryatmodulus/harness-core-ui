import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { LaunchButton } from '../LaunchButton/LaunchButton'

export default function AccountSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  return (
    <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink exact label={getString('overview')} to={routes.toAccountSettingsOverview({ accountId })} />
      <SidebarLink label={getString('authentication')} to={routes.toAuthenticationSettings({ accountId })} />
      <SidebarLink label={getString('common.accountResources')} to={routes.toAccountResources({ accountId })} />
      <SidebarLink to={routes.toAccessControl({ accountId })} label={getString('accessControl')} />
      {(createdFromNG || NG_LICENSES_ENABLED) && (
        <SidebarLink exact label={getString('common.subscriptions.title')} to={routes.toSubscriptions({ accountId })} />
      )}
      <SidebarLink label={getString('orgsText')} to={routes.toOrganizations({ accountId })} />
      <LaunchButton
        launchButtonText={getString('common.cgLaunchText')}
        redirectUrl={returnLaunchUrl(`#/account/${accountId}/dashboard`)}
      />
    </Layout.Vertical>
  )
}

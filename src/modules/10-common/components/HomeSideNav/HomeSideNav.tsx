import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import AccountSetupMenu from '@common/navigation/AccountSetupMenu/AccountSetupMenu'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function HomeSideNav(): React.ReactElement {
  const params = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { NG_DASHBOARDS } = useFeatureFlags()

  return (
    <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink label={getString('common.welcome')} to={routes.toGetStarted(params)} />
      <SidebarLink label={getString('projectsText')} to={routes.toProjects(params)} />
      {NG_DASHBOARDS && <SidebarLink label={getString('common.dashboards')} to={routes.toCustomDasboard(params)} />}
      <AccountSetupMenu />
    </Layout.Vertical>
  )
}

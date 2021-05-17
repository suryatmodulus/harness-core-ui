import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import AccountSetupMenu from '@common/navigation/AccountSetupMenu/AccountSetupMenu'

export default function HomeSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      <SidebarLink label={getString('common.home')} to={routes.toProjectsGetStarted(params)} />
      <SidebarLink label={getString('projectsText')} to={routes.toProjects(params)} />
      <SidebarLink label={getString('common.dashboards')} to={routes.toCustomDasboardHome(params)} />
      <AccountSetupMenu />
    </Layout.Vertical>
  )
}

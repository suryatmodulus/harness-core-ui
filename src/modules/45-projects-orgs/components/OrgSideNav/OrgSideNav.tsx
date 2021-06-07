import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import OrgSetupMenu from '@common/navigation/OrgSetupMenu/OrgSetupMenu'

export default function OrgsSideNav(): React.ReactElement {
  const params = useParams<OrgPathProps>()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink exact label={getString('overview')} to={routes.toOrganizationDetails(params)} />
      <OrgSetupMenu />
    </Layout.Vertical>
  )
}

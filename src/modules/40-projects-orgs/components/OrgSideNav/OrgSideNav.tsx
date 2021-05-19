import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function OrgsSideNav(): React.ReactElement {
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  const params = useParams<OrgPathProps>()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      <SidebarLink exact label={getString('overview')} to={routes.toOrganizationDetails(params)} />
      <SidebarLink label={getString('connectorsLabel')} to={routes.toConnectors(params)} />
      <SidebarLink label={getString('common.secrets')} to={routes.toSecrets(params)} />
      {NG_RBAC_ENABLED ? <SidebarLink label={getString('accessControl')} to={routes.toAccessControl(params)} /> : null}
    </Layout.Vertical>
  )
}

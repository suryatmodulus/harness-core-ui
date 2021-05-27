import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function AccountSettingsSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  return (
    <Layout.Vertical spacing="small">
      <SidebarLink label={getString('authentication')} to={routes.toAuthenticationSettings({ accountId })} />
      <SidebarLink exact label="Overview" to={routes.toAdmin({ accountId })} />
      <SidebarLink label="Resources" to={routes.toResources({ accountId })} />
      {/* TODO: ENABLE WHEN READY */}
      {/* <SidebarLink label="Governance" to={routes.toGovernance({ accountId })} /> */}
      {/* <SidebarLink label="Git Sync" to={routes.toGitSync({ accountId })} /> */}
      {NG_RBAC_ENABLED ? (
        <SidebarLink to={routes.toAccessControl({ accountId })} label={getString('accessControl')} />
      ) : null}
      <SidebarLink label="Organizations" to={routes.toOrganizations({ accountId })} />
    </Layout.Vertical>
  )
}

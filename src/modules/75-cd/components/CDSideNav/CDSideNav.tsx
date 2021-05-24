import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { AdminSelector, AdminSelectorLink } from '@common/navigation/AdminSelector/AdminSelector'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function CDSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const module = 'cd'
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const { SERVICE_DASHBOARD_NG, GIT_SYNC_NG, CD_OVERVIEW_PAGE } = useFeatureFlags()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CD}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toCDProjectOverview({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || '',
              accountId
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {CD_OVERVIEW_PAGE && <SidebarLink label="Overview" to={routes.toCDProjectOverview(params)} />}
          <SidebarLink label="Deployments" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />
          {SERVICE_DASHBOARD_NG ? <SidebarLink label="Services" to={routes.toServices({ ...params, module })} /> : null}
          <AdminSelector path={routes.toCDAdmin(params)}>
            <AdminSelectorLink label="Resources" iconName="main-scope" to={routes.toResources({ ...params, module })} />
            {GIT_SYNC_NG ? (
              <AdminSelectorLink
                label={getString('gitManagement')}
                iconName="git-repo"
                to={routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module })}
              />
            ) : null}
            <AdminSelectorLink
              label="Access Control"
              iconName="user"
              to={routes.toAccessControl({ orgIdentifier, projectIdentifier, module, accountId })}
            />
            {/* <AdminSelectorLink label="Template Library" iconName="grid" to="" disabled />
            <AdminSelectorLink label="Governance" iconName="shield" to="" disabled />
            <AdminSelectorLink label="General Settings" iconName="settings" to="" disabled /> */}
          </AdminSelector>
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

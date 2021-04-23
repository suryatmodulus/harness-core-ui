import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { AdminSelector, AdminSelectorLink } from '@common/navigation/AdminSelector/AdminSelector'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function CISideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = params
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const module = 'ci'
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const { GIT_SYNC_NG } = useFeatureFlags()
  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CI}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          // if a user is on a pipeline related page, redirect them to project dashboard
          if (projectIdentifier && !pipelineIdentifier) {
            // changing project
            history.push(
              compile(routeMatch.path)({
                ...routeMatch.params,
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier
              })
            )
          } else {
            history.push(
              routes.toCIProjectOverview({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || '',
                accountId
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          <SidebarLink label="Overview" to={routes.toCIProjectOverview(params)} />
          <SidebarLink label="Builds" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />

          <AdminSelector path={routes.toCIAdmin(params)}>
            <AdminSelectorLink label="Resources" iconName="main-scope" to={routes.toResources({ ...params, module })} />
            {GIT_SYNC_NG ? (
              <AdminSelectorLink
                label={getString('gitManagement')}
                iconName="git-repo"
                to={routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier })}
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

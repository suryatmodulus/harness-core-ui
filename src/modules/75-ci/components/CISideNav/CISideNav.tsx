import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type {
  ConnectorPathProps,
  PipelinePathProps,
  ResourceGroupPathProps,
  RolePathProps,
  SecretsPathProps,
  UserGroupPathProps,
  UserPathProps
} from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'

export default function CISideNav(): React.ReactElement {
  const params = useParams<
    PipelinePathProps &
      ConnectorPathProps &
      SecretsPathProps &
      UserPathProps &
      UserGroupPathProps &
      ResourceGroupPathProps &
      RolePathProps
  >()
  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    connectorId,
    secretId,
    userIdentifier,
    userGroupIdentifier,
    roleIdentifier,
    resourceGroupIdentifier
  } = params
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const module = 'ci'
  const { updateAppStore } = useAppStore()
  const { CI_OVERVIEW_PAGE } = useFeatureFlags()
  const { trial } = useQueryParams<{ trial?: boolean }>()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CI}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          if (connectorId) {
            history.push(
              routes.toConnectors({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (secretId) {
            history.push(
              routes.toSecrets({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (userIdentifier) {
            history.push(
              routes.toUsers({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (roleIdentifier) {
            history.push(
              routes.toRoles({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (resourceGroupIdentifier) {
            history.push(
              routes.toResourceGroups({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (userGroupIdentifier) {
            history.push(
              routes.toUserGroups({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          } else if (projectIdentifier && !pipelineIdentifier) {
            // changing project
            history.push(
              compile(routeMatch.path)({
                ...routeMatch.params,
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier
              })
            )
          } else {
            // when it's on trial page, forward to pipeline
            if (trial) {
              history.push({
                pathname: routes.toPipelineStudio({
                  orgIdentifier: data.orgIdentifier || '',
                  projectIdentifier: data.identifier || '',
                  pipelineIdentifier: '-1',
                  accountId,
                  module
                }),
                search: '?modal=trial'
              })
            } else {
              history.push(
                routes.toProjectOverview({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier || '',
                  accountId,
                  module
                })
              )
            }
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {CI_OVERVIEW_PAGE && <SidebarLink label="Overview" to={routes.toProjectOverview({ ...params, module })} />}
          <SidebarLink label="Builds" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />

          <ProjectSetupMenu module={module} />
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

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
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { LaunchButton } from '@common/components/LaunchButton/LaunchButton'

export default function CDSideNav(): React.ReactElement {
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
  const module = 'cd'
  const { updateAppStore } = useAppStore()
  const { CD_OVERVIEW_PAGE, ARGO_PHASE1 } = useFeatureFlags()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CD}
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
            history.push(
              routes.toProjectOverview({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId,
                module
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {CD_OVERVIEW_PAGE && <SidebarLink label="Overview" to={routes.toProjectOverview({ ...params, module })} />}
          <SidebarLink label="Deployments" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />
          <SidebarLink label="Services" to={routes.toServices({ ...params, module })} />
          {ARGO_PHASE1 && <SidebarLink label="GitOps" to={routes.toGitOps({ ...params, module })} />}
          <ProjectSetupMenu module={module} />
        </React.Fragment>
      ) : null}
      <LaunchButton
        launchButtonText={getString('cd.cdLaunchText')}
        redirectUrl={returnLaunchUrl(`#/account/${params.accountId}/dashboard`)}
      />
    </Layout.Vertical>
  )
}

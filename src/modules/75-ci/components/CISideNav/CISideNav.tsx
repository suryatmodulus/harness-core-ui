import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'

export default function CISideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = params
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
                routes.toCIProjectOverview({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier || '',
                  accountId
                })
              )
            }
          }
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          {CI_OVERVIEW_PAGE && <SidebarLink label="Overview" to={routes.toCIProjectOverview(params)} />}
          <SidebarLink label="Builds" to={routes.toDeployments({ ...params, module })} />
          <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />

          <ProjectSetupMenu module={module} />
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName, useAppStore } from 'framework/exports'
import { useStrings } from 'framework/exports'

export default function CESideNav(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CE}
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
              routes.toCECORules({
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
          <SidebarLink
            label={getString('ce.co.breadCrumb.rules')}
            to={routes.toCECORules({ accountId, projectIdentifier, orgIdentifier })}
          />
          <SidebarLink
            label={getString('ce.co.accessPoint.ap')}
            to={routes.toCECOAccessPoints({ accountId, projectIdentifier, orgIdentifier })}
          />
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

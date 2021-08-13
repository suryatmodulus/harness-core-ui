import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

export default function ProjectsSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          // changing project
          history.push(
            compile(routeMatch.path)({
              ...routeMatch.params,
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier
            })
          )
        }}
      />
      <SidebarLink label={getString('overview')} to={routes.toProjectDetails(params)} />
    </Layout.Vertical>
  )
}

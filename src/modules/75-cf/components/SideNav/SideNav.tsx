import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/exports'

export default function CFSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const module = 'cf'
  const { updateAppStore } = useAppStore()
  const isDev = location.hostname === 'localhost' || location.hostname === 'qb.harness.io'

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CF}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toCFFeatureFlags({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || '',
              accountId
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          <SidebarLink label="Feature Flags" to={routes.toCFFeatureFlags(params)} />
          <SidebarLink label="Targets" to={routes.toCFTargets(params)} />
          <SidebarLink label="Environments" to={routes.toCFEnvironments(params)} />
          {isDev && (
            <>
              <SidebarLink label="Executions" to={routes.toDeployments({ ...params, module })} />
              <SidebarLink label="Pipelines" to={routes.toPipelines({ ...params, module })} />
            </>
          )}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

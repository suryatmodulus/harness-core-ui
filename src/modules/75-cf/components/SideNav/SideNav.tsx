import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './SideNav.module.scss'

export default function CFSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const module = 'cf'
  const { updateAppStore } = useAppStore()
  const isDev = localStorage.ENABLED_FF_EXPERIMENTS

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
          <SidebarLink label={getString('featureFlagsText')} to={routes.toCFFeatureFlags(params)} />
          <SidebarLink label={getString('pipeline.targets.title')} to={routes.toCFTargets(params)} />
          <SidebarLink label={getString('cf.shared.segments')} to={routes.toCFSegments(params)} />
          <SidebarLink label={getString('environments')} to={routes.toCFEnvironments(params)} />
          {isDev && (
            <>
              <SidebarLink label={getString('executionsText')} to={routes.toDeployments({ ...params, module })} />
              <SidebarLink label={getString('pipelines')} to={routes.toPipelines({ ...params, module })} />
            </>
          )}
          {isDev && (
            <SidebarLink
              className={css.onboarding}
              label={getString('cf.shared.getStarted')}
              to={routes.toCFOnboarding(params)}
            />
          )}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

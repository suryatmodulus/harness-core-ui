import React from 'react'
import { useParams, useHistory, matchPath, useLocation } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import navCSS from '@common/navigation/SideNav/SideNav.module.scss'

export default function CFSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const { withActiveEnvironment } = useActiveEnvironment()
  const location = useLocation()
  const isDev = localStorage.ENABLED_FF_EXPERIMENTS
  const toDeployments = routes.toDeployments({ ...params, module: 'cf' })
  const toPipelines = routes.toPipelines({ ...params, module: 'cf' })
  const isCFPipelines = !!(
    matchPath(location.pathname, { path: toDeployments }) || matchPath(location.pathname, { path: toPipelines })
  )
  const { trial } = useQueryParams<{ trial?: boolean }>()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CF}
        onSelect={data => {
          updateAppStore({ selectedProject: data })

          if (trial) {
            // if select from trial page, forward user to get started page
            history.push({
              pathname: routes.toCFOnboarding({
                orgIdentifier: data?.orgIdentifier || '',
                projectIdentifier: data?.identifier || '',
                accountId
              })
            })
          } else {
            history.push(
              routes.toCFFeatureFlags({
                projectIdentifier: data.identifier,
                orgIdentifier: data.orgIdentifier || '',
                accountId
              })
            )
          }
        }}
      />
      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink
            label={getString('featureFlagsText')}
            to={withActiveEnvironment(routes.toCFFeatureFlags(params))}
          />
          <SidebarLink
            label={getString('cf.shared.targetManagement')}
            to={withActiveEnvironment(routes.toCFTargetManagement(params))}
          />
          <SidebarLink label={getString('environments')} to={withActiveEnvironment(routes.toCFEnvironments(params))} />
          {isDev && (
            <SidebarLink
              label={getString('pipelines')}
              to={withActiveEnvironment(toDeployments)}
              className={isCFPipelines ? navCSS.selected : undefined}
            />
          )}
          <SidebarLink
            label={getString('cf.shared.getStarted')}
            to={withActiveEnvironment(routes.toCFOnboarding(params))}
          />

          <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
            <Layout.Vertical spacing="small">
              <SidebarLink
                to={routes.toAccessControl({ ...params, module: 'cf' })}
                label={getString('accessControl')}
              />
            </Layout.Vertical>
          </NavExpandable>
        </>
      )}
    </Layout.Vertical>
  )
}

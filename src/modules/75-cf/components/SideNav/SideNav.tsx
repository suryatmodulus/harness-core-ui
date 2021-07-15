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
import { useQueryParams } from '@common/hooks'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './SideNav.module.scss'

export default function CFSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const history = useHistory()
  const { updateAppStore } = useAppStore()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { NG_RBAC_ENABLED } = useFeatureFlags()
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
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          <SidebarLink
            label={getString('featureFlagsText')}
            to={withActiveEnvironment(routes.toCFFeatureFlags(params))}
          />
          <SidebarLink
            label={getString('cf.shared.targetManagement')}
            to={withActiveEnvironment(routes.toCFTargetManagement(params))}
          />
          <SidebarLink label={getString('environments')} to={withActiveEnvironment(routes.toCFEnvironments(params))} />
          <SidebarLink
            className={css.onboarding}
            label={getString('cf.shared.getStarted')}
            to={withActiveEnvironment(routes.toCFOnboarding(params))}
          />

          {NG_RBAC_ENABLED && (
            <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
              <Layout.Vertical spacing="small">
                <SidebarLink
                  to={routes.toAccessControl({ ...params, module: 'cf' })}
                  label={getString('accessControl')}
                />
              </Layout.Vertical>
            </NavExpandable>
          )}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

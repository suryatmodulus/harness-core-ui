import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { AdminSelector, AdminSelectorLink } from '@common/navigation/AdminSelector/AdminSelector'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'

export default function CVSideNav(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const { getString } = useStrings()
  const history = useHistory()
  const { updateAppStore } = useAppStore()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CV}
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
              routes.toCVProjectOverview({
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
            label="Overview"
            to={routes.toCVProjectOverview({ accountId, projectIdentifier, orgIdentifier })}
          />
          {/* <SidebarLink
            label={getString('changes')}
            to={routes.toCVActivityDashboard({ accountId, projectIdentifier, orgIdentifier })}
          /> */}
          <SidebarLink label="Services" to={routes.toCVServices({ accountId, projectIdentifier, orgIdentifier })} />
          <AdminSelector path={routes.toCVAdmin({ accountId, projectIdentifier, orgIdentifier })}>
            <AdminSelectorLink
              label={getString('cv.navLinks.adminSideNavLinks.setup')}
              iconName="resources-icon"
              to={routes.toCVAdminSetup({
                projectIdentifier,
                orgIdentifier,
                accountId
              })}
            />
            <AdminSelectorLink
              label="Notifications"
              iconName="main-notifications"
              to={routes.toCVAdminNotifications({
                projectIdentifier,
                orgIdentifier,
                accountId
              })}
            />
            <AdminSelectorLink
              label={getString('resources')}
              iconName="main-scope"
              to={routes.toResources({ projectIdentifier, orgIdentifier, accountId, module: 'cv' })}
            />
            <AdminSelectorLink
              label={getString('cv.navLinks.adminSideNavLinks.activitySources')}
              iconName="square"
              to={routes.toCVAdminActivitySources({ projectIdentifier, orgIdentifier, accountId })}
            />
            <AdminSelectorLink
              label={getString('cv.navLinks.adminSideNavLinks.monitoringSources')}
              iconName="desktop"
              to={routes.toCVAdminMonitoringSources({ projectIdentifier, orgIdentifier, accountId })}
            />
            <AdminSelectorLink
              label={getString('verificationJobs')}
              iconName="confirm"
              to={routes.toCVAdminVerificationJobs({ projectIdentifier, orgIdentifier, accountId })}
            />
          </AdminSelector>
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

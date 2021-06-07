import React from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'

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
          <SidebarLink
            label={getString('cv.navLinks.adminSideNavLinks.setup')}
            to={routes.toCVAdminSetup({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <SidebarLink
            label="Notifications"
            to={routes.toCVAdminNotifications({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <SidebarLink
            label={getString('cv.navLinks.adminSideNavLinks.activitySources')}
            to={routes.toCVAdminActivitySources({ projectIdentifier, orgIdentifier, accountId })}
          />
          <SidebarLink
            label={getString('cv.navLinks.adminSideNavLinks.monitoringSources')}
            to={routes.toCVAdminMonitoringSources({ projectIdentifier, orgIdentifier, accountId })}
          />
          <SidebarLink
            label={getString('verificationJobs')}
            to={routes.toCVAdminVerificationJobs({ projectIdentifier, orgIdentifier, accountId })}
          />
          <ProjectSetupMenu module="cv" />
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

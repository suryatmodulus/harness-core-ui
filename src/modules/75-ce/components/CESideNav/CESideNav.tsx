import React, { useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { compile } from 'path-to-regexp'

import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { LaunchButton } from '@common/components/LaunchButton/LaunchButton'

export default function CESideNav(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const { currentUserInfo, updateAppStore } = useAppStore()
  const { getString } = useStrings()
  const { identifyUser } = useTelemetry()
  useEffect(() => {
    identifyUser(currentUserInfo.email)
  }, [])
  useTelemetry({ pageName: 'CloudCostPage' })
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
                orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                accountId
              })
            )
          }
        }}
      />
      {
        <React.Fragment>
          <SidebarLink label={getString('overview')} to={routes.toCEOverview({ accountId })} />
          <SidebarLink
            label={getString('ce.sideNav.perspective')}
            to={routes.toCEPerspectiveDashboard({ accountId, projectIdentifier, orgIdentifier })}
          />
          <SidebarLink
            label={getString('ce.co.breadCrumb.rules')}
            to={routes.toCECORules({ accountId, projectIdentifier, orgIdentifier })}
          />
          <SidebarLink
            label={getString('ce.co.accessPoint.loadbalancers')}
            to={routes.toCECOAccessPoints({ accountId, projectIdentifier, orgIdentifier })}
          />
        </React.Fragment>
      }
      {localStorage.CE_DEV ? (
        <>
          <SidebarLink
            label={getString('ce.recommendation.sideNavText')}
            to={routes.toCERecommendations({ accountId })}
          />
          <SidebarLink label={getString('ce.perspectives.sideNavText')} to={routes.toCEPerspectives({ accountId })} />
        </>
      ) : null}
      <LaunchButton
        launchButtonText={getString('common.ce.visibilityLaunchButton')}
        redirectUrl={returnLaunchUrl(`#/account/${accountId}/continuous-efficiency/overview`)}
      />
    </Layout.Vertical>
  )
}

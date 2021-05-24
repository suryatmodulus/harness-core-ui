import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'

export default function CESideNav(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
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
          history.push(
            routes.toCECORules({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || '',
              accountId
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <React.Fragment>
          <SidebarLink
            label={getString('ce.co.breadCrumb.rules')}
            to={routes.toCECORules({ accountId, projectIdentifier, orgIdentifier })}
          />
          <SidebarLink
            label={getString('ce.co.accessPoint.loadbalancer')}
            to={routes.toCECOAccessPoints({ accountId, projectIdentifier, orgIdentifier })}
          />
          {localStorage.RECOMMENDATIONS ? (
            <SidebarLink
              label={getString('ce.recommendation.sideNavText')}
              to={routes.toCERecommendations({ accountId, projectIdentifier, orgIdentifier })}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </Layout.Vertical>
  )
}

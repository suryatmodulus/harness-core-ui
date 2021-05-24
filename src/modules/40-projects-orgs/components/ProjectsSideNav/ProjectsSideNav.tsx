import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@common/navigation/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export default function ProjectsSideNav(): React.ReactElement {
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  const params = useParams<PipelinePathProps>()
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
            routes.toProjectDetails({
              accountId: params.accountId,
              orgIdentifier: data.orgIdentifier || '',
              projectIdentifier: data.identifier
            })
          )
        }}
      />
      <SidebarLink label={getString('overview')} to={routes.toProjectDetails(params)} />
      <SidebarLink label={getString('resources')} to={routes.toResources(params)} />
      {NG_RBAC_ENABLED ? <SidebarLink label={getString('accessControl')} to={routes.toAccessControl(params)} /> : null}
    </Layout.Vertical>
  )
}

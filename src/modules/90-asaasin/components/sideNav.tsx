import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'

import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'

export default function AsaasinSideNav(): React.ReactElement {
  const { accountId } = useParams<PipelinePathProps>()
  useTelemetry({ pageName: 'CloudCostPage' })
  return (
    <Layout.Vertical spacing="small">
      <React.Fragment>
        <SidebarLink label="Dashboard" to={routes.toAsaasinDashboard({ accountId })} />
        <SidebarLink label="Workflows" to={routes.toAsaasinWorkflows({ accountId })} />
      </React.Fragment>
    </Layout.Vertical>
  )
}

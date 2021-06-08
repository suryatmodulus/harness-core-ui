import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Color } from '@wings-software/uicore'
import { useGet } from 'restful-react'
// import { useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'

import { useStrings } from 'framework/strings'

export default function DashboardsSideNav(): React.ReactElement {
  const { accountId } = useParams<AccountPathProps & Partial<ProjectPathProps>>()
  const { getString } = useStrings()
  // const history = useHistory()
  const { data: dashboardList } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'dashboard/list',
    queryParams: { accountId: accountId }
  })

  // React.useEffect(() => {
  //   if (history?.action === 'PUSH' && history.location.pathname.includes('/dashboards/view')) {
  //     refetch()
  //   }
  // }, [history?.location?.pathname])

  return (
    <Layout.Vertical spacing="small">
      <SidebarLink label="All Dashboards" to={routes.toCustomDasboard({ accountId })} />
      {dashboardList?.resource?.list?.length > 0 && (
        <section
          style={{
            marginTop: 'var(--spacing-medium)',
            paddingLeft: 'var(--spacing-small)',
            fontSize: '12px',
            color: 'var(--grey-500)',
            letterSpacing: '1.1px'
          }}
        >
          {getString('dashboards.sideNav.byHarness')}
        </section>
      )}
      {dashboardList?.resource?.list?.length > 0 &&
        dashboardList?.resource?.list?.map((_dashboard: { title: string; id: string; type: string }) => {
          if (_dashboard.type === 'SHARED') {
            return (
              <SidebarLink
                key={_dashboard?.title}
                label={_dashboard?.title}
                to={routes.toViewCustomDashboard({ accountId, viewId: _dashboard?.id })}
              />
            )
          }
        })}

      {dashboardList?.resource?.list?.length > 0 && (
        <section
          style={{
            paddingTop: 'var(--spacing-medium)',
            borderTop: '1px solid var(--grey-600)',
            paddingLeft: 'var(--spacing-small)',
            marginTop: 'var(--spacing-medium)',
            fontSize: '12px',
            color: 'var(--grey-500)',
            letterSpacing: '1.1px'
          }}
        >
          {getString('dashboards.sideNav.custom')}
        </section>
      )}
      {dashboardList?.resource?.list?.length > 0 &&
        !dashboardList?.resource?.list?.find((v: { type: string }) => v.type === 'ACCOUNT') && (
          <Text
            color={Color.GREY_600}
            font={{ size: 'small', italic: true }}
            style={{ paddingLeft: 'var(--spacing-small)' }}
          >
            {getString('dashboards.sideNav.noDashboard')}
          </Text>
        )}
      {dashboardList?.resource?.list?.length > 0 &&
        dashboardList?.resource?.list?.map((_dashboard: { title: string; id: string; type: string }) => {
          if (_dashboard.type === 'ACCOUNT') {
            return (
              <SidebarLink
                key={_dashboard?.title}
                label={_dashboard?.title}
                to={routes.toViewCustomDashboard({ accountId, viewId: _dashboard?.id })}
              />
            )
          }
        })}
    </Layout.Vertical>
  )
}

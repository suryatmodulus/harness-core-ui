import React from 'react'
import { Route, useParams, Redirect, Switch } from 'react-router-dom'
import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { requestPolicyExchange } from '@urql/exchange-request-policy'
import routes from '@common/RouteDefinitions'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { MinimalLayout } from '@common/layouts'
import SessionToken from 'framework/utils/SessionToken'

import CESideNav from '@ce/components/CESideNav/CESideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { getConfig } from 'services/config'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import CEHomePage from './pages/home/CEHomePage'
import CEDashboardPage from './pages/dashboard/CEDashboardPage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'
import CECOEditGatewayPage from './pages/co-edit-gateway/CECOEditGatewayPage'
import CECOLoadBalancersPage from './pages/co-access-points/CECOAccessPointsPage'
import Budgets from './pages/budgets/Budgets'
import CETrialHomePage from './pages/home/CETrialHomePage'

import RecommendationList from './pages/recommendationList/RecommendationList'
import RecommendationDetailsPage from './pages/recommendationDetails/RecommendationDetailsPage'
import PerspectiveDetailsPage from './pages/perspective-details/PerspectiveDetailsPage'
import CreatePerspectivePage from './pages/perspective-builder/CreatePerspectivePage'
import PerspectiveListPage from './pages/perspective-list/PerspectiveListPage'
import WorkloadDetailsPage from './pages/workload-details/WorkloadDetailsPage'
import OverviewPage from './pages/overview/OverviewPage'
import NodeRecommendationDetailsPage from './pages/node-recommendation-details/NodeRecommendationDetailsPage'

const CESideNavProps: SidebarContext = {
  navComponent: CESideNav,
  subtitle: 'CLOUD COST',
  title: 'Management',
  icon: 'ce-main'
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'ce'
      })}
    />
  )
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CE.toLowerCase() as Module
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CCM_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

const CERoutes: React.FC = () => {
  const token = SessionToken.getToken()
  const { accountId } = useParams<AccountPathProps>()

  const getRequestOptions = React.useCallback((): Partial<RequestInit> => {
    const headers: RequestInit['headers'] = {}

    if (token && token.length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers }
  }, [token])

  const urqlClient = React.useCallback(() => {
    const url = getConfig(`ccm/api/graphql?accountIdentifier=${accountId}&routingId=${accountId}`)

    // if (url.startsWith('/')) {
    //   url = url.substr(1)
    // }
    return createClient({
      url: url,
      fetchOptions: () => {
        return getRequestOptions()
      },
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [token, accountId])

  return (
    <Provider value={urqlClient()}>
      <Switch>
        <RouteWithLayout
          layout={MinimalLayout}
          path={routes.toModuleTrialHome({ ...accountPathProps, module: 'ce' })}
          exact
        >
          <CETrialHomePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          path={routes.toCEHome({ ...accountPathProps })}
          exact
        >
          <CEHomePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEOverview({ ...accountPathProps, ...projectPathProps })}
        >
          <OverviewPage />
        </RouteWithLayout>
        <RouteWithLayout
          sidebarProps={CESideNavProps}
          path={routes.toCEDashboard({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <CEDashboardPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECORules({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <CECODashboardPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOCreateGateway({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <CECOCreateGatewayPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOEditGateway({
            ...accountPathProps,
            ...projectPathProps,
            gatewayIdentifier: ':gatewayIdentifier'
          })}
          exact
        >
          <CECOEditGatewayPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECOAccessPoints({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <CECOLoadBalancersPage />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEBudgets({ ...accountPathProps })}
          exact
        >
          <Budgets />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendations({ ...accountPathProps, ...projectPathProps })}
          exact
        >
          <RecommendationList />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendationDetails({
            ...accountPathProps,
            ...projectPathProps,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <RecommendationDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCENodeRecommendationDetails({
            ...accountPathProps,
            ...projectPathProps,
            recommendationName: ':recommendationName',
            recommendation: ':recommendation'
          })}
          exact
        >
          <NodeRecommendationDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          sidebarProps={CESideNavProps}
          path={routes.toPerspectiveDetails({
            ...accountPathProps,
            perspectiveId: ':perspectiveId',
            perspectiveName: ':perspectiveName'
          })}
          exact
        >
          <PerspectiveDetailsPage />
        </RouteWithLayout>

        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCECreatePerspective({
            ...accountPathProps,
            perspectiveId: ':perspectiveId'
          })}
          exact
        >
          <CreatePerspectivePage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEPerspectives({
            ...accountPathProps
          })}
          exact
        >
          <PerspectiveListPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEPerspectiveWorkloadDetails({
            ...accountPathProps,
            perspectiveId: ':perspectiveId',
            perspectiveName: ':perspectiveName',
            clusterName: ':clusterName',
            namespace: ':namespace',
            workloadName: ':workloadName'
          })}
          exact
        >
          <WorkloadDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCERecommendationWorkloadDetails({
            ...accountPathProps,
            recommendation: ':recommendation',
            recommendationName: ':recommendationName',
            clusterName: ':clusterName',
            namespace: ':namespace',
            workloadName: ':workloadName'
          })}
          exact
        >
          <WorkloadDetailsPage />
        </RouteWithLayout>
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          sidebarProps={CESideNavProps}
          path={routes.toCEOverview({ ...accountPathProps })}
          exact
        >
          <OverviewPage />
        </RouteWithLayout>
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export default CERoutes

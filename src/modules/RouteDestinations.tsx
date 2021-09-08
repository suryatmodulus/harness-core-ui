import React, { Suspense } from 'react'
import { Switch, Route, NavLink, useRouteMatch } from 'react-router-dom'
import { RoutesTemp } from '@wings-software/test-app-publish-'

// import RoutesTemp from 'nav/Routes1'

//import TextInput from '@wings-software/TextBox1'
import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AuthSettingsRoutes from '@auth-settings/RouteDestinations'
import secretsRoutes from '@secrets/RouteDestinations'
import rbacRoutes from '@rbac/RouteDestinations'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import '@templates-library/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { AppStoreContext, useAppStore } from 'framework/AppStore/AppStoreContext'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}
//import { RoutesTemp, About3, Topics, TopicsWrap, ChildAppApi } from '@wings-software/test-app-publish-'
import ReactDOM from 'react-dom'
import lazyLegacyRoot from './lazyLegacyRoot'

// function parentAppContext = ()=>{
//   console.log('testing parent app context update')
// }
const TopicsWrap = lazyLegacyRoot(() =>
  import('@wings-software/test-app-publish-').then(module => ({ default: module.TopicsWrap }))
)
// const TopicsWrap = lazyLegacyRoot(() => import('./Topics'))
function AddRouteDiv() {
  const { url } = useRouteMatch()

  const { currentUserInfo } = useAppStore()
  const addDiv = () => {
    // console.log('ChildAppApi.getChildApp()', ChildAppApi.getChildApp())
    // ChildAppApi.renderChildApp({ elementId: 'access-control-root', contextObj: AppStoreContext, url })
    // //ReactDOM.render(<ChildApp url={url} contextObj={AppStoreContext} />, document.getElementById('access-control-root'))
  }
  // const ChildApp = ChildAppApi.getChildApp()
  return (
    <div>
      <h2>in Parent app with react {React.version}</h2>
      <h2>currentUserInfo emailid in parent : {currentUserInfo.email} </h2>
      <div
        dangerouslySetInnerHTML={{ __html: `<div id='access-control-root'>Child Application should render here</div>` }}
      ></div>
      <Suspense fallback={() => null}>
        <TopicsWrap url={url} contextObj={AppStoreContext} />
      </Suspense>

      <button onClick={addDiv}>addDiv</button>
      <NavLink to="/account/:accountId/addroute/components">child components link</NavLink>
    </div>
  )
}
export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  console.log('RoutesTemp', { RoutesTemp })
  return (
    <Switch>
      <Route path="/account/:accountId/addroute">
        <AddRouteDiv />
      </Route>
      {...commonRoutes.props.children}
      {...secretsRoutes.props.children}
      {...rbacRoutes.props.children}
      {...delegatesRoutes.props.children}
      {...projectsOrgsRoutes.props.children}
      {...DASHBOARDRoutes.props.children}
      {...connectorRoutes.props.children}
      {...userProfileRoutes.props.children}

      {...CING_ENABLED ? CIRoutes.props.children : []}
      {...CDNG_ENABLED ? CDRoutes.props.children : []}
      {...CVNG_ENABLED ? CVRoutes.props.children : []}

      <Route path="/account/:accountId/settingsfd">
        <div>Testing new route</div>
      </Route>
      <React.Fragment>
        <RoutesTemp contextObj={AppStoreContext} />
      </React.Fragment>

      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {...CFNG_ENABLED ? CFRoutes.props.children : []}
    </Switch>
  )
}

import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
//import { RoutesTemp } from '@wings-software/test-app-publish-'

// import RoutesTemp from 'nav/Routes1'

//import TextInput from 'nav/TextBox1'
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
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { HelloWorld, renderHelloApp } from '@wings-software/vue3-component-library'

// // import renderApp from '@wings-software/vue3-component-library'
//import { createApp } from 'vue'
// import { HelloWorld } from './helloworld/index'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}
function AddRouteDiv() {
  const [count, setCount] = useState(0)
  //console.log('createApp', createApp)
  const addDiv = () => {
    // var div = document.createElement('div')
    // div.setAttribute('id', 'access-control-root-1')
    // document.body.appendChild(div)
    console.log('renderHelloApp', renderHelloApp, HelloWorld)
    renderHelloApp('access-control-root')
    //createApp(HelloWorld).mount('#access-control-root')
    // new Vue({
    //   el: '#access-control-root',
    //   components: { HelloWorld },
    //   template: '<HelloWorld/>'
    // })
    // console.log('ChildAppApi.getChildApp()', ChildAppApi.getChildApp())
    // ChildAppApi.renderChildApp({ elementId: 'access-control-root', contextObj: AppStoreContext, url })
    // //ReactDOM.render(<ChildApp url={url} contextObj={AppStoreContext} />, document.getElementById('access-control-root'))
  }
  // const ChildApp = ChildAppApi.getChildApp()
  return (
    <div>
      <h2>in Parent app with react {React.version}</h2>
      <h2>currentUserInfo emailid in parent :</h2>
      <div>counter :{count}</div>
      <div id="access-control-root">Child Application should render here</div>
      {/* <div
        dangerouslySetInnerHTML={{ __html: `<div id='access-control-root'>Child Application should render here</div>` }}
      ></div> */}
      <button onClick={addDiv}>addDiv</button>
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        increment count
      </button>
    </div>
  )
}
export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()

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

      {/* <Route path="/account/:accountId/settingsfd">
        <TextInput label="Email Addresss" placeholder="name@example.com" />
      </Route> */}
      {/* <React.Fragment>
        <RoutesTemp contextObj={AppStoreContext} />
      </React.Fragment> */}

      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {...CFNG_ENABLED ? CFRoutes.props.children : []}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

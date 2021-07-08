import React from 'react'
import routes from '@common/RouteDefinitions'

//import CDSideNav from '@cd/components/CDSideNav/CDSideNav'
import SideNav from '@common/navigation/SideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'
import TemplatesList from './pages/TemplatesList/TemplatesList'

const SideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'LIBRARY',
  title: 'Templates',
  icon: 'cd-main'
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={SideNavProps}
      path={routes.toTemplatesListing({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <TemplatesList />
    </RouteWithLayout>
  </>
)

import React from 'react'
import { Route as RouterRoute } from 'react-router-dom'
import type { RouteProps as RouterRouteprops } from 'react-router-dom'
import { ModalProvider } from '@wings-software/uicore'
import { DefaultLayout, MinimalLayout } from '@common/layouts'
import SidebarProvider, { SidebarContext } from '@common/navigation/SidebarProvider'
import { useLicenseStore, LICENSE_STATE_VALUES } from 'framework/LicenseStore/LicenseStoreContext'
import CITrialHomePage from './pages/home/CITrialHomePage'
export interface RouteWithLayoutProps extends RouterRouteprops {
  layout: React.ComponentType
  sidebarProps?: SidebarContext
}

export default function RouteWithLayout(props: React.PropsWithChildren<RouteWithLayoutProps>): React.ReactElement {
  const { children, layout: Layout, sidebarProps, ...rest } = props
  const { CI_LICENSE_STATE } = useLicenseStore()

  if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return (
      <RouterRoute {...rest}>
        <ModalProvider>
          {sidebarProps ? (
            <SidebarProvider {...sidebarProps}>
              <Layout>{children}</Layout>
            </SidebarProvider>
          ) : (
            <Layout>{children}</Layout>
          )}
        </ModalProvider>
      </RouterRoute>
    )
  } else {
    return (
      <RouterRoute>
        <ModalProvider>
          <MinimalLayout>
            <CITrialHomePage />
          </MinimalLayout>
        </ModalProvider>
      </RouterRoute>
    )
  }
}
RouteWithLayout.defaultProps = {
  layout: DefaultLayout
}

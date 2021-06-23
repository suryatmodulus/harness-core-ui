import React from 'react'
import { Route as RouterRoute } from 'react-router-dom'
import type { RouteProps as RouterRouteprops } from 'react-router-dom'

import { ModalProvider } from '@wings-software/uicore'
import { DefaultLayout } from '@common/layouts'
import SidebarProvider, { SidebarContext } from '@common/navigation/SidebarProvider'
// import { LICENSE_STATE_VALUES, LicenseRedirectProps, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'

export interface RouteWithLayoutProps extends RouterRouteprops {
  layout: React.ComponentType
  sidebarProps?: SidebarContext
  licenseRedirectData?: LicenseRedirectProps
}

export function RouteWithLayout(props: React.PropsWithChildren<RouteWithLayoutProps>): React.ReactElement {
  const { children, layout: Layout, sidebarProps, licenseRedirectData, ...rest } = props
  // const licenseStore = useLicenseStore()

  const childComponent = (
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

  return childComponent

  // For modules with no licenseStateName passed we will always show the child components
  // This allows pages to still render for products like CD and CE which have not gone GA and are still
  // using old licensing mechanisms
  // if (!licenseRedirectData) {
  //   return childComponent
  // }

  // const {
  //   licenseStateName,
  //   startTrialRedirect: StartTrialRedirect,
  //   expiredTrialRedirect: ExpiredTrialRedirect
  // } = licenseRedirectData

  // const licenseValue = licenseStateName && licenseStore[licenseStateName]

  // switch (licenseValue) {
  //   case LICENSE_STATE_VALUES.ACTIVE:
  //     return childComponent
  //   case LICENSE_STATE_VALUES.NOT_STARTED:
  //     return (
  //       <RouterRoute {...rest}>
  //         <StartTrialRedirect />
  //       </RouterRoute>
  //     )
  //   case LICENSE_STATE_VALUES.EXPIRED:
  //     return (
  //       <RouterRoute {...rest}>
  //         <ExpiredTrialRedirect />
  //       </RouterRoute>
  //     )
  //   default:
  //     return childComponent
  // }
}

RouteWithLayout.defaultProps = {
  layout: DefaultLayout
}

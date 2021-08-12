import React from 'react'
import type { SideNavProps } from './SideNav/SideNav'

export interface SidebarContext extends SideNavProps {
  navComponent: React.ComponentType
}

const SidebarContext = React.createContext<SidebarContext>({
  title: '',
  subtitle: '',
  navComponent: function DefaultNav() {
    return null
  }
})

export function useSidebar(): SidebarContext {
  return React.useContext(SidebarContext)
}

export default function SidebarProvider(props: React.PropsWithChildren<SidebarContext>): React.ReactElement {
  const { children, ...value } = props

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

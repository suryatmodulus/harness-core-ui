import React from 'react'
import { Tabs as BpTabs, Tab, ITabsProps } from '@blueprintjs/core'
import css from './Tabs.module.scss'

export interface TabsProps extends Omit<ITabsProps, 'renderActiveTabPanelOnly'> {
  renderAllTabPanels?: boolean
  children?: React.ReactNode
}

const Tabs: React.FC<TabsProps> = (props: TabsProps) => {
  const { renderAllTabPanels, children, ...rest } = props

  return (
    <BpTabs {...rest} renderActiveTabPanelOnly={!renderAllTabPanels} className={css.main}>
      {children}
    </BpTabs>
  )
}

export { Tabs, Tab }

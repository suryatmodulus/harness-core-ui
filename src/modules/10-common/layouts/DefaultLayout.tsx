import React, { useRef, useState } from 'react'

import { Button } from '@wings-software/uicore'
import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'

import { useSidebar } from '@common/navigation/SidebarProvider'

import css from './layouts.module.scss'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent } = useSidebar()
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const handleTransition = (): void => {
    ref.current?.classList.toggle(css.isNavClosed)
    setIsOpen(!isOpen)
  }
  return (
    <div className={css.main}>
      <MainNav />
      <div>
        <div className={css.layout} ref={ref}>
          <SideNav
            title={title}
            subtitle={subtitle}
            icon={icon}
            closeButton={<Button className={css.openButton} icon="arrow-left" onClick={handleTransition} round />}
          >
            <NavComponent />
          </SideNav>
        </div>
        {!isOpen && <Button className={css.closeButton} icon="arrow-right" onClick={handleTransition} round />}
      </div>
      <div className={css.children}>{props.children}</div>
    </div>
  )
}

import React, { useState } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { Layout, Text } from '@wings-software/uicore'
import css from './NavExpandable.module.scss'

interface NavExpandableProps {
  title: string
  route: string
  className?: string
}

const NavExpandable: React.FC<React.PropsWithChildren<NavExpandableProps>> = ({
  title,
  route,
  children,
  className
}) => {
  const [mouseEnter, setMouseEnter] = useState<boolean>(false)
  const { pathname } = useLocation()
  const isSelected = matchPath(pathname, route)
  return (
    <Layout.Vertical
      className={className}
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
    >
      <Text rightIcon="caret-down" className={css.main}>
        {title}
      </Text>
      {isSelected || mouseEnter ? children : null}
    </Layout.Vertical>
  )
}

export default NavExpandable

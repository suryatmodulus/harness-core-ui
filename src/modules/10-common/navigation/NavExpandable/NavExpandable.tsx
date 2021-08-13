import React, { useState } from 'react'
import cx from 'classnames'
import { useLocation, matchPath } from 'react-router-dom'
import { Layout, Text } from '@wings-software/uicore'
import css from './NavExpandable.module.scss'

interface NavExpandableProps {
  title: string
  route: string
  className?: string
  withoutBorder?: boolean
}

const NavExpandable: React.FC<React.PropsWithChildren<NavExpandableProps>> = ({
  title,
  route,
  children,
  className,
  withoutBorder = false
}) => {
  const [mouseEnter, setMouseEnter] = useState<boolean>(false)
  const { pathname } = useLocation()
  const isSelected = matchPath(pathname, route)
  const timerRef = React.useRef<number | null>(null)

  const handleMouseEvent = (val: boolean): void => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setMouseEnter(val)
    }, 300)
  }

  return (
    <div>
      {!withoutBorder && <div className={css.border} />}
      <Layout.Vertical
        className={cx(className, css.main)}
        onMouseEnter={() => handleMouseEvent(true)}
        onMouseLeave={() => handleMouseEvent(false)}
      >
        <Text
          rightIcon={isSelected || mouseEnter ? 'chevron-up' : 'chevron-down'}
          className={css.text}
          font="xsmall"
          flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          {title}
        </Text>
        {isSelected || mouseEnter ? children : null}
      </Layout.Vertical>
    </div>
  )
}

export default NavExpandable

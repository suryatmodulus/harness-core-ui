import React from 'react'
import { Icon, IconName, Card, Container } from '@wings-software/uicore'
import cx from 'classnames'
import type { Module } from '@common/interfaces/RouteInterfaces'
import css from './WelcomePage.module.scss'

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
}

interface ModuleCardProps {
  option: ModuleProps
  onClick?: (module: Module) => void
  selected?: boolean
  className?: string
  cornerSelected?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({ option, onClick, selected, className, cornerSelected }) => {
  return (
    <Card
      data-testid={option.module}
      className={cx(css.card, className)}
      onClick={() => {
        onClick?.(option.module)
      }}
      selected={selected}
      cornerSelected={cornerSelected}
    >
      <Container className={css.iconContainer}>
        <Icon name={option.titleIcon} size={120} className={css.titleIcon} />
        <Icon name={option.bodyIcon} size={80} className={css.bodyIcon} />
      </Container>
    </Card>
  )
}

export default ModuleCard

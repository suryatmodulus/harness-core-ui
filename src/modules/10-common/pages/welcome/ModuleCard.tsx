import React from 'react'
import { Icon, IconName, Card, Container, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import type { Module } from '@common/interfaces/RouteInterfaces'
import css from './WelcomePage.module.scss'

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
  description: string
}

interface ModuleCardProps {
  option: ModuleProps
  onClick?: (module: Module) => void
  selected?: boolean
  className?: string
  cornerSelected?: boolean
  buttonText: string
  handleButtonClick?: () => void
  buttonDisabled?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  option,
  onClick,
  selected,
  className,
  cornerSelected,
  handleButtonClick,
  buttonText
}) => {
  return (
    <div className={cx(css.cardContainer)}>
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
          <Text font={{ align: 'center' }} className={css.iconDescription}>
            {option.description}
          </Text>
        </Container>
      </Card>
      {selected && (
        <Button intent="primary" onClick={handleButtonClick} width="100%">
          {buttonText}
        </Button>
      )}
    </div>
  )
}

export default ModuleCard

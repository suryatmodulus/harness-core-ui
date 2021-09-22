import React from 'react'
import cx from 'classnames'
import { Text, Color, Container } from '@wings-software/uicore'
import type { MonitoredServiceDTO } from 'services/cv'
import { MonitoredServiceType } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import css from './MonitoredServiceCategory.module.scss'

export default function MonitoredServiceCategory({ type }: { type?: MonitoredServiceDTO['type'] }): JSX.Element {
  switch (type) {
    case 'Infrastructure':
      return (
        <Container className={cx(css.monitoredServiceCategory, css.infrastructure)}>
          <Text className={css.categoryName} iconProps={{ size: 18, color: Color.PURPLE_500 }} icon="infrastructure">
            {MonitoredServiceType.INFRASTRUCTURE}
          </Text>
        </Container>
      )
    case 'Application':
      return (
        <Container className={cx(css.monitoredServiceCategory, css.application)}>
          <Text className={css.categoryName} iconProps={{ size: 13, color: Color.PRIMARY_8 }} icon="dashboard">
            {MonitoredServiceType.APPLICATION}
          </Text>
        </Container>
      )
    default:
      return <Container />
  }
}

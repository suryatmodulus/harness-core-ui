import React from 'react'
import { Container } from '@wings-software/uicore'
import type { Feature } from 'services/cf'
import css from './MetricsView.module.scss'

export const TabServedTargets: React.FC<{ flagData: Feature; startDate: Date; endDate: Date }> = () => {
  return <Container className={css.contentBody}></Container>
}

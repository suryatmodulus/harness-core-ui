import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import ChangesTable from './components/ChangesTable/ChangesTable'
import type { ChangesAndServiceDependencyInterface } from './ChangesAndServiceDependency.types'
import MonitoredServiceDependenciesChart from './components/MonitoredServiceDependenciesChart/MonitoredServiceDependenciesChart'
import css from './ChangesAndServiceDependency.module.scss'

export default function ChangesAndServiceDependency({
  startTime,
  endTime,
  hasChangeSource,
  serviceIdentifier,
  environmentIdentifier
}: ChangesAndServiceDependencyInterface): JSX.Element {
  const { getString } = useStrings()

  return (
    <Container flex>
      <Container className={css.changesTable}>
        <ChangesTable
          startTime={startTime as number}
          endTime={endTime as number}
          hasChangeSource={hasChangeSource}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </Container>
      <Container className={css.serviceDependency}>
        <Text font={{ weight: 'bold', size: 'normal' }} padding={{ bottom: 'medium' }}>
          {getString('pipeline.serviceDependenciesText')}
        </Text>
        <MonitoredServiceDependenciesChart
          serviceIdentifier={serviceIdentifier}
          envIdentifier={environmentIdentifier}
        />
      </Container>
    </Container>
  )
}

import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import noDataImage from '@cv/assets/noData.svg'
import ChangesTable from './components/ChangesTable/ChangesTable'
import type { ChangesAndServiceDependencyInterface } from './ChangesAndServiceDependency.types'
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
        <Card className={css.noDataContainer}>
          <Container className={css.noData}>
            <NoDataCard message={getString('cv.monitoredServices.noAvailableData')} image={noDataImage} />
          </Container>
        </Card>
      </Container>
    </Container>
  )
}

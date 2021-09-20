import React from 'react'
import { Text, Color, Container, Card, Checkbox } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ServiceCardInterface } from './SelectServiceCard.types'
import { MonitoredServiceType } from '../../Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import css from './SelectServiceCard.module.scss'

export default function SelectServiceCard({ data, isChecked, onChange }: ServiceCardInterface): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.cardListContainer}>
      <Card className={css.serviceCard}>
        <Container flex>
          <Checkbox checked={isChecked} id={data?.serviceRef} className={css.selectService} onChange={onChange} />
          <div>
            <Text>{data?.serviceName}</Text>
            <Text color={Color.GREY_200} font={{ size: 'small' }}>
              {`${getString('common.ID')}: ${data.serviceRef}`}
            </Text>
          </div>
        </Container>
        <div className={css.serviceCardChip}>
          <Text iconProps={{ size: 15 }} icon={'dashboard'}>
            {MonitoredServiceType.APPLICATION}
          </Text>
        </div>
      </Card>
    </Container>
  )
}

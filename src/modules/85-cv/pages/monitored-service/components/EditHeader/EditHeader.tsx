import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import type { EditHeaderProps } from './EditHeader.types'
import css from './EditHeader.module.scss'

export default function EditHeader(props: EditHeaderProps): JSX.Element {
  const { monitoredServiceData, lastModifiedAt } = props
  return (
    <Container className={css.container}>
      <Container className={css.leftContainer}>
        <Text font={{ size: 'medium', weight: 'bold' }}>{monitoredServiceData?.name}</Text>
        <Text
          font={{ size: 'small' }}
          padding={{ left: 'medium', top: 'xsmall' }}
        >{`ID: ${monitoredServiceData?.identifier}`}</Text>
      </Container>
      <Container className={css.rightContainer}>
        <Text font={{ size: 'small' }}>{`Last updated: ${moment(lastModifiedAt).format(
          'MM/DD/YYYY hh:mm:ss a'
        )}`}</Text>
        <Container className={css.serviceAndType}>
          <Text className={css.monitoredServiceData} lineClamp={1}>{`Type: ${monitoredServiceData?.type}`}</Text>
          <Text
            className={css.monitoredServiceData}
            lineClamp={1}
          >{`Service: ${monitoredServiceData?.serviceRef}`}</Text>
        </Container>
        <Text className={css.monitoredServiceData}>{`Environment: ${monitoredServiceData?.environmentRef}`}</Text>
      </Container>
    </Container>
  )
}

import React from 'react'
import { useParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Container, Color, Icon, PageError } from '@wings-software/uicore'
import { useGetMonitoredServiceDetails } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SummaryCardContent from '../../GraphSummaryCard/GraphSummaryCard'
import type { SummaryCardProps } from '../ServiceDependencyGraph.types'
import css from '../ServiceDependencyGraph.module.scss'

export const SummaryCard: React.FC<SummaryCardProps> = ({ point, ...rest }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { data, loading, refetch, error } = useGetMonitoredServiceDetails({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier: point?.serviceRef,
      environmentIdentifier: point?.environmentRef
    }
  })

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} width={300} />
  }

  if (!data) {
    return null
  }

  return <SummaryCardContent {...rest} monitoredService={data} />
}

const SummaryCardWrapper: React.FC<SummaryCardProps> = ({ point, ...rest }) => {
  if (!point?.sticky?.element) {
    return null
  }

  return createPortal(
    <foreignObject className="node" width="360px" height="435px">
      <Container
        height="100%"
        padding="large"
        background={Color.GREY_700}
        onClick={e => e.stopPropagation()}
        className={css.graphSummaryCard}
      >
        <SummaryCard {...rest} point={point} />
      </Container>
    </foreignObject>,
    point.sticky.element
  )
}

export default SummaryCardWrapper

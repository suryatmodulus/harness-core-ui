import React from 'react'
import { Container } from '@wings-software/uicore'
import StageHeader from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionGraph/components/StageHeader'
import css from './HoverCard.module.scss'

export interface HoverCardProps {
  data?: any
  children?: any
}

export default function HoverCard(props: HoverCardProps): React.ReactElement {
  const { data } = props
  return (
    <Container className={css.hovercard}>
      <StageHeader data={data} />
      {props?.children}
    </Container>
  )
}

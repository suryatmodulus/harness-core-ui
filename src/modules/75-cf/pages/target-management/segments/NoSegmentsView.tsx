import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import { NoData } from '@cf/components/NoData/NoData'
import { useStrings } from 'framework/strings'
import { NewSegmentButton } from './NewSegmentButton'
import imageURL from './segment.svg'

export interface NoSegmentsViewProps {
  hasEnvironment: boolean
  onNewSegmentCreated: (segmentIdentifier: string) => void
}

export const NoSegmentsView: React.FC<NoSegmentsViewProps> = ({ hasEnvironment, onNewSegmentCreated }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <NoData
        imageURL={imageURL}
        message={getString(hasEnvironment ? 'cf.segments.noSegmentForEnv' : 'cf.segments.noSegment')}
      >
        <NewSegmentButton
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          onCreated={onNewSegmentCreated}
        />
      </NoData>
    </Container>
  )
}

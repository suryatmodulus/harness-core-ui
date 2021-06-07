import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import { NoData } from '@cf/components/NoData/NoData'
import { useStrings } from 'framework/strings'
import { NewTargets } from './NewTarget'
import imageURL from './target.svg'

export interface NoTargetsViewProps {
  onNewTargetsCreated: () => void
  hasEnvironment: boolean
}

export const NoTargetsView: React.FC<NoTargetsViewProps> = ({ onNewTargetsCreated, hasEnvironment }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <NoData imageURL={imageURL} message={getString(hasEnvironment ? 'cf.noTargetForEnv' : 'cf.noTarget')}>
        <NewTargets
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          onCreated={onNewTargetsCreated}
        />
      </NoData>
    </Container>
  )
}

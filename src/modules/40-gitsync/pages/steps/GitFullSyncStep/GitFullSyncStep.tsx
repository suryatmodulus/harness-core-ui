import React from 'react'
import type { StepProps } from '@wings-software/uicore'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import FullSyncForm from '@gitsync/components/FullSyncForm/FullSyncForm'

export interface GitFullSyncStepProps {
  name: string
  orgIdentifier: string
  projectIdentifier: string
  onClose: () => void
  onSuccess: () => void
}

export const GitFullSyncStep: React.FC<StepProps<unknown> & GitFullSyncStepProps> = props => {
  const { orgIdentifier, projectIdentifier, onClose, onSuccess } = props

  return (
    <GitSyncStoreProvider>
      <FullSyncForm
        isNewUser={true}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </GitSyncStoreProvider>
  )
}

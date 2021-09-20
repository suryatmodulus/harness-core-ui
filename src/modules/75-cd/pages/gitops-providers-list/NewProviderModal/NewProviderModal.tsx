import { Button, ButtonVariation } from '@wings-software/uicore'
import React, { useState, useEffect } from 'react'
import type { GitopsProviderResponse } from 'services/cd-ng'
import { isConnectedGitOpsProvider } from '@cd/utils/GitOpsUtils'
import CreateProvider from '../CreateProvider/CreateProvider'

import css from './NewProviderModal.module.scss'

interface NewProviderModalProps {
  provider: GitopsProviderResponse | null
  onClose?(): void
  onLaunchArgoDashboard?: (provider: GitopsProviderResponse) => void
}

const NewProviderModal: React.FC<NewProviderModalProps> = props => {
  const { provider } = props
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (isConnectedGitOpsProvider(provider?.spec)) {
      setIsEditMode(true)
    }
  }, [])

  return (
    <div className={css.addNewProviderModal}>
      <div className={css.providerModalContainer}>
        <CreateProvider isEditMode={isEditMode} onUpdateMode={(mode: boolean) => setIsEditMode(mode)} {...props} />
      </div>

      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={() => {
          props.onClose?.()
        }}
        className={css.crossIcon}
      />
    </div>
  )
}

export default NewProviderModal

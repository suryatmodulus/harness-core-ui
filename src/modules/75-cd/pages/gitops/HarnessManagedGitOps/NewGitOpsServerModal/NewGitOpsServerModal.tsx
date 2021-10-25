import { Button, ButtonVariation } from '@wings-software/uicore'
import React from 'react'
import type { V1Agent } from 'services/gitops'
import CreateProvider from '../CreateGitOpsServer/CreateGitOpsServer'

import css from './NewGitOpsServerModal.module.scss'

interface NewProviderModalProps {
  provider: V1Agent | null
  isEditMode: boolean
  onClose?(): void
  onUpdateMode?(mode: boolean): void
  onLaunchArgoDashboard?: (provider: V1Agent) => void
}

const NewProviderModal: React.FC<NewProviderModalProps> = props => {
  return (
    <div className={css.addNewProviderModal}>
      <div className={css.providerModalContainer}>
        <CreateProvider onUpdateMode={props.onUpdateMode} {...props} />
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

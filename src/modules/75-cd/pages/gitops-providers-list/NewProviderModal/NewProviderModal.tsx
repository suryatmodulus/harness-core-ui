import { Button, ButtonVariation } from '@wings-software/uicore'
import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import type { GitopsProviderResponse } from 'services/cd-ng'
import { isConnectedGitOpsProvider } from '@cd/utils/GitOpsUtils'
import argoLogo from '@cd/icons/argo-logo.svg'
import harnessLogo from '@cd/icons/harness-logo.png'
import CreateProvider from '../CreateProvider/CreateProvider'

import css from './NewProviderModal.module.scss'

interface NewProviderModalProps {
  provider: GitopsProviderResponse | null
  onClose?(): void
  onLaunchArgoDashboard?: (provider: GitopsProviderResponse) => void
}

const NewProviderModal: React.FC<NewProviderModalProps> = props => {
  const { provider } = props
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (isConnectedGitOpsProvider(provider?.spec)) {
      setShowCreateModal(true)
      setIsEditMode(true)
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createProvider = (type: string) => {
    setIsEditMode(false)

    if (type === 'argo') {
      setShowCreateModal(true)
    } else {
      setShowCreateModal(true)
    }
  }

  return (
    <div className={css.addNewProviderModal}>
      {!showCreateModal && (
        <div className={css.providerContainer}>
          <h1 className={css.title}> Specify your provider </h1>
          <div className={css.providers}>
            <div className={css.provider}>
              <img src={argoLogo} alt="" aria-hidden onClick={() => createProvider('argo')} />
              <p> Argo </p>
            </div>

            <div className={cx(css.provider, css.disabled)}>
              <img
                src={harnessLogo}
                alt=""
                aria-hidden
                //   onClick={() => createProvider('harnessManaged')}
              />
              <p>
                Harness <br /> Managed Argo
              </p>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className={css.providerModalContainer}>
          <CreateProvider isEditMode={isEditMode} onUpdateMode={(mode: boolean) => setIsEditMode(mode)} {...props} />
        </div>
      )}

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

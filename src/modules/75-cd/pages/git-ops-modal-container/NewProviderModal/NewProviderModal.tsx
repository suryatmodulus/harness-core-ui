import { Button, ButtonVariation } from '@wings-software/uicore'
import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import CreateArgoProvider from '../CreateArgoProvider/CreateArgoProvider'
import argoLogo from '../images/argo-logo.svg'
import harnessLogo from '../images/harness-logo.png'

import css from './NewProviderModal.module.scss'

interface NewProviderModalProps {
  provider: any
  onClose: any
}

const NewProviderModal: React.FC<NewProviderModalProps> = props => {
  const { provider } = props
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (provider && provider?.type === 'ArgoConnector') {
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
                Harness Managed <br /> Argo
              </p>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className={css.providerModalContainer}>
          <CreateArgoProvider isEditMode={isEditMode} provider={props.provider} onClose={props.onClose} />
        </div>
      )}

      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={() => {
          props.onClose()
        }}
        className={css.crossIcon}
      />
    </div>
  )
}

export default NewProviderModal

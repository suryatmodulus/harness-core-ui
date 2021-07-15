import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { SamlSettings } from 'services/cd-ng'
import SAMLProviderForm from './views/SAMLProviderForm'
import css from './useSAMLProvider.module.scss'

interface Props {
  onSuccess: () => void
}

interface UseSAMLProviderReturn {
  openSAMlProvider: (_samlProvider?: SamlSettings) => void
  closeSAMLProvider: () => void
}

export const useSAMLProviderModal = ({ onSuccess }: Props): UseSAMLProviderReturn => {
  const [samlProvider, setSamlProvider] = React.useState<SamlSettings>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={cx(Classes.DIALOG, css.dialog)}>
        <SAMLProviderForm
          samlProvider={samlProvider}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={() => {
            hideModal()
          }}
        />
      </Dialog>
    ),
    [samlProvider]
  )

  const open = (_samlProvider?: SamlSettings): void => {
    setSamlProvider(_samlProvider)
    showModal()
  }

  return {
    openSAMlProvider: open,
    closeSAMLProvider: hideModal
  }
}

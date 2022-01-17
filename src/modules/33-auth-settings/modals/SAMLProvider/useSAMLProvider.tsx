import React from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { SamlSettings } from 'services/cd-ng'
import SAMLProviderForm from './views/SAMLProviderForm'
interface Props {
  onSuccess: () => void
}

interface UseSAMLProviderReturn {
  openSAMlProvider: (_samlProvider?: SamlSettings) => void
  closeSAMLProvider: () => void
}

export const useSAMLProviderModal = ({ onSuccess }: Props): UseSAMLProviderReturn => {
  const [samlProvider, setSamlProvider] = React.useState<SamlSettings>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        title={samlProvider ? getString('authSettings.editSAMLProvider') : getString('authSettings.addSAMLProvider')}
        enforceFocus={false}
        onClose={hideModal}
        style={{ minWidth: 'max-content' }}
      >
        <SAMLProviderForm
          samlProvider={samlProvider}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={hideModal}
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

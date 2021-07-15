import React, { useState } from 'react'
import { useModalHook, Button, Text, Color } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'

import type { SecretDTOV2, ConnectorInfoDTO } from 'services/cd-ng'

import CreateUpdateSecret, {
  SecretIdentifiers,
  SecretFormData
} from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'

import { useStrings } from 'framework/strings'
import css from './useCreateSecretModal.module.scss'

type SecretType = SecretDTOV2['type']

export interface UseCreateSecretModalProps {
  onSuccess?: ((data: SecretFormData) => void) | (() => void)
  connectorTypeContext?: ConnectorInfoDTO['type']
  privateSecret?: boolean
}

export interface UseCreateSecretModalReturn {
  openCreateSecretModal: (type: SecretType, secret?: SecretIdentifiers) => void
  closeCreateSecretModal: () => void
}

const useCreateUpdateSecretModal = (props: UseCreateSecretModalProps): UseCreateSecretModalReturn => {
  const [type, setType] = useState<SecretType>()
  const [secret, setSecret] = useState<SecretIdentifiers>()
  const handleSuccess = (data: SecretFormData) => {
    hideModal()
    props.onSuccess?.(data)
  }
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        <Text font={{ size: 'medium' }} color={Color.BLACK} margin={{ bottom: 'large' }}>
          {secret?.identifier
            ? !type || type === 'SecretText'
              ? getString('secret.titleEditText')
              : getString('secret.titleEditFile')
            : type === 'SecretText'
            ? getString('secret.titleCreateText')
            : getString('secret.titleCreateFile')}
        </Text>
        <CreateUpdateSecret
          secret={secret}
          type={type}
          onSuccess={handleSuccess}
          connectorTypeContext={props.connectorTypeContext}
          privateSecret={props.privateSecret}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [type, secret]
  )

  return {
    openCreateSecretModal: (_type: SecretType | undefined, _secret: SecretIdentifiers | undefined) => {
      setType(_type)
      setSecret(_secret)
      showModal()
    },
    closeCreateSecretModal: hideModal
  }
}

export default useCreateUpdateSecretModal

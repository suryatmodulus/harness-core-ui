import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import CreateOrSelectSecret from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper, ConnectorInfoDTO } from 'services/cd-ng'
import { ReferenceSelectDialogTitle } from '@common/components/ReferenceSelect/ReferenceSelect'
import { useStrings } from 'framework/strings'
import css from './useCreateOrSelectSecretModal.module.scss'

export interface UseCreateOrSelectSecretModalProps {
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  handleInlineSSHSecretCreation?: () => void
}

export interface UseCreateOrSelectSecretModalReturn {
  openCreateOrSelectSecretModal: () => void
  closeCreateOrSelectSecretModal: () => void
}

const useCreateOrSelectSecretModal = (
  props: UseCreateOrSelectSecretModalProps,
  inputs?: any[]
): UseCreateOrSelectSecretModalReturn => {
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={ReferenceSelectDialogTitle({ componentName: getString('secretType') })}
        className={css.dialog}
      >
        <CreateOrSelectSecret
          {...props}
          onCancel={hideModal}
          onSuccess={secret => {
            /* istanbul ignore next */
            props.onSuccess?.(secret)
            hideModal()
          }}
          connectorTypeContext={props.connectorTypeContext}
          handleInlineSSHSecretCreation={() => {
            props.handleInlineSSHSecretCreation?.()
            hideModal()
          }}
        />
      </Dialog>
    ),
    inputs || []
  )

  return {
    openCreateOrSelectSecretModal: () => {
      showModal()
    },
    closeCreateOrSelectSecretModal: hideModal
  }
}

export default useCreateOrSelectSecretModal

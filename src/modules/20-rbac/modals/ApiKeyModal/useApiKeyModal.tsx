import React, { useCallback, useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import type { ApiKeyDTO, TokenDTO } from 'services/cd-ng'
import ApiKeyForm from './views/ApiKeyForm'
import css from './useApiKeyModal.module.scss'

export interface useApiKeyModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

export interface useApiKeyModalReturn {
  openApiKeyModal: (ApiKey?: ApiKeyDTO) => void
  closeApiKeyModal: () => void
}

export const useApiKeyModal = ({
  onSuccess,
  parentIdentifier,
  apiKeyType
}: useApiKeyModalProps): useApiKeyModalReturn => {
  const [ApiKeyData, setApiKeyData] = useState<ApiKeyDTO>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        title=""
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <ApiKeyForm
          data={ApiKeyData}
          isEdit={!!ApiKeyData}
          apiKeyType={apiKeyType}
          parentIdentifier={parentIdentifier}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
        />
      </Dialog>
    ),
    [ApiKeyData]
  )
  const open = useCallback(
    (_ApiKey?: ApiKeyDTO) => {
      setApiKeyData(_ApiKey)
      showModal()
    },
    [showModal]
  )

  return {
    openApiKeyModal: open,
    closeApiKeyModal: hideModal
  }
}

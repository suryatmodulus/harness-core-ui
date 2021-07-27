import React, { useCallback, useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { TokenDTO } from 'services/cd-ng'
import TokenForm from './views/TokenForm'
import RotateTokenForm from './views/RotateTokenForm'
import css from './useTokenModal.module.scss'

export interface useTokenModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

export interface useTokenModalReturn {
  openTokenModal: (apiKeyIdentifier: string, token?: TokenDTO, _isRotate?: boolean) => void
  closeTokenModal: () => void
}

export const useTokenModal = ({ onSuccess, apiKeyType, parentIdentifier }: useTokenModalProps): useTokenModalReturn => {
  const [apiKeyIdentifier, setApiKeyIdentifier] = useState<string>('')
  const [isRotate, setIsRotate] = useState<boolean>()
  const [tokenData, setTokenData] = useState<TokenDTO>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        className={cx(css.dialog, Classes.DIALOG)}
        title=""
      >
        {isRotate ? (
          <RotateTokenForm
            data={tokenData}
            apiKeyIdentifier={apiKeyIdentifier}
            onSubmit={onSuccess}
            onClose={hideModal}
          />
        ) : (
          <TokenForm
            data={tokenData}
            apiKeyIdentifier={apiKeyIdentifier}
            isEdit={!!tokenData}
            apiKeyType={apiKeyType}
            parentIdentifier={parentIdentifier}
            onSubmit={onSuccess}
            onClose={hideModal}
          />
        )}
      </Dialog>
    ),
    [tokenData, apiKeyIdentifier, isRotate, parentIdentifier]
  )
  const open = useCallback(
    (_apiKeyIdentifier: string, _token?: TokenDTO, _isRotate?: boolean) => {
      setApiKeyIdentifier(_apiKeyIdentifier)
      setTokenData(_token)
      setIsRotate(_isRotate)
      showModal()
    },
    [showModal]
  )

  return {
    openTokenModal: open,
    closeTokenModal: hideModal
  }
}

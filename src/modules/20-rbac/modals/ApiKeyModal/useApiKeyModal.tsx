/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
          onClose={hideModal}
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

import React, { useCallback, useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { ServiceAccountDTO } from 'services/cd-ng'
import ServiceAccountForm from './views/ServiceAccountForm'
import css from './useServiceAccountModal.module.scss'

export interface useServiceAccountModalProps {
  onSuccess: (serviceAccount: ServiceAccountDTO) => void
  onCloseModal?: () => void
}

export interface useServiceAccountModalReturn {
  openServiceAccountModal: (serviceAccount?: ServiceAccountDTO) => void
  closeServiceAccountModal: () => void
}

export const useServiceAccountModal = ({ onSuccess }: useServiceAccountModalProps): useServiceAccountModalReturn => {
  const [serviceAccountData, setServiceAccountData] = useState<ServiceAccountDTO>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        className={cx(css.dialog, Classes.DIALOG)}
        title=""
      >
        <ServiceAccountForm
          data={serviceAccountData}
          isEdit={!!serviceAccountData}
          onSubmit={serviceAccount => {
            onSuccess(serviceAccount)
            hideModal()
          }}
        />
      </Dialog>
    ),
    [serviceAccountData]
  )
  const open = useCallback(
    (_serviceAccount?: ServiceAccountDTO) => {
      setServiceAccountData(_serviceAccount)
      showModal()
    },
    [showModal]
  )

  return {
    openServiceAccountModal: open,
    closeServiceAccountModal: hideModal
  }
}

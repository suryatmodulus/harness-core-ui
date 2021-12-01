import React, { useCallback, useState } from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import type { ServiceAccountDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import ServiceAccountForm from './views/ServiceAccountForm'

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
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        title={
          serviceAccountData
            ? getString('rbac.serviceAccounts.form.editServiceAccount')
            : getString('rbac.serviceAccounts.newServiceAccount')
        }
      >
        <ServiceAccountForm
          data={serviceAccountData}
          isEdit={!!serviceAccountData}
          onClose={hideModal}
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

import React, { useState } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button, useModalHook } from '@wings-software/uicore'
import type { AccessPoint } from 'services/lw'
import LoadBalancerDnsConfig from '../COGatewayAccess/LoadBalancerDnsConfig'
import AzureAPConfig from './AzureAPConfig'

interface UseEditAccessPointProps {
  onUpdate?: (updatedAccessPoint: AccessPoint) => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

const useEditAccessPoint = (props: UseEditAccessPointProps) => {
  const [apToEdit, setApToEdit] = useState<AccessPoint>()
  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <>
          {apToEdit?.type === 'aws' && (
            <LoadBalancerDnsConfig
              loadBalancer={apToEdit}
              cloudAccountId={apToEdit.cloud_account_id}
              onClose={closeModal}
              mode={'edit'}
              onSave={props.onUpdate}
            />
          )}
          {apToEdit?.type === 'azure' && (
            <AzureAPConfig
              cloudAccountId={apToEdit.cloud_account_id}
              onSave={lb => props.onUpdate?.(lb)}
              mode={'edit'}
              onClose={closeModal}
              loadBalancer={apToEdit}
            />
          )}
        </>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            closeModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    ),
    [apToEdit]
  )
  return {
    openEditAccessPointModal: (accessPoint: AccessPoint) => {
      setApToEdit(accessPoint)
      openModal()
    }
  }
}

export default useEditAccessPoint

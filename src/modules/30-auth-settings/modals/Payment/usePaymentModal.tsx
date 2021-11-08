import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import PaymentForm from './views/PaymentForm'

interface UsePaymentModalReturn {
  openPaymentModal: () => void
  closePaymentModal: () => void
}

export const usePaymentModal = (): UsePaymentModalReturn => {
  const [showModal, hideModal] = useModalHook(() => (
    <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={cx(Classes.DIALOG)}>
      <PaymentForm />
    </Dialog>
  ))

  const open = (): void => {
    showModal()
  }

  return {
    openPaymentModal: open,
    closePaymentModal: hideModal
  }
}

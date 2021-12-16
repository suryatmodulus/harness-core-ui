import React from 'react'
import { useModalHook, Dialog, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { ModuleName } from 'framework/types/ModuleName'
import { Editions } from '@common/constants/SubscriptionTypes'
import SubscriptionToggler from './SubscriptionToggler'
import SubscriptionCalculator from './SubscriptionCalculator'

import css from './SubscriptionCalculatorModal.module.scss'

export interface UseSubscribeCalculatorModalReturns {
  openSubscribeCalculatorModal: () => void
  closeSubscribeCalculatorModal: () => void
}

interface SubscribeCalculatorDialogProps {
  onClose: () => void
  onReviewChange: () => void
}

interface UseSubscribeCalculatorModalProps {
  onReviewChange: () => void
}

// mock data, until the api is ready
const moduleName = ModuleName.CD
const subscribePlan = Editions.ENTERPRISE
const unitPrice = 100
const supportPrice = 150

const SubscribeCalculatorContainer = ({ onReviewChange }: UseSubscribeCalculatorModalProps): React.ReactElement => (
  <Layout.Vertical>
    <SubscriptionToggler moduleName={moduleName} subscribePlan={subscribePlan} />
    <SubscriptionCalculator unitPrice={unitPrice} supportPrice={supportPrice} onReviewChange={onReviewChange} />
  </Layout.Vertical>
)

const SubscribeCalculatorDialog = ({ onClose, onReviewChange }: SubscribeCalculatorDialogProps): React.ReactElement => {
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={onClose}
      className={cx(css.dialog, css.subscribeCalculatorDialog)}
    >
      <SubscribeCalculatorContainer onReviewChange={onReviewChange} />
    </Dialog>
  )
}

export const useSubscribeCalculatorModal = ({
  onReviewChange
}: UseSubscribeCalculatorModalProps): UseSubscribeCalculatorModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    function onCloseModal(): void {
      hideModal()
    }

    return <SubscribeCalculatorDialog onClose={onCloseModal} onReviewChange={onReviewChange} />
  }, [])

  return {
    openSubscribeCalculatorModal: showModal,
    closeSubscribeCalculatorModal: hideModal
  }
}

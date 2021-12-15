import React from 'react'
import { useModalHook, Dialog, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { ModuleName } from 'framework/types/ModuleName'
import { Editions, PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import SubscribeInfo from './SubscribeInfo'
import PaymentInfo from './PaymentInfo'

import css from './SubscriptionPayModal.module.scss'

export interface UseSubscribePayModalReturns {
  openSubscribePayModal: () => void
  closeSubscribePayModal: () => void
}

interface SubscribePayDialogProps {
  onClose: () => void
}

// mock data, until the api is ready
const moduleName = ModuleName.CD
const subscribePlanInfo = {
  subscribePlan: Editions.ENTERPRISE,
  services: 30,
  unitPrice: 100,
  unit: PLAN_UNIT.MONTHLY,
  premiumSupport: 200
}
const currentPlanInfo = {
  currentPlan: Editions.FREE,
  currentPlanInfo: {
    services: 20
  }
}

const SubscribePayContainer = (): React.ReactElement => (
  <Layout.Horizontal>
    <SubscribeInfo moduleName={moduleName} subscribePlanInfo={subscribePlanInfo} currentPlanInfo={currentPlanInfo} />
    <PaymentInfo />
  </Layout.Horizontal>
)

const SubscribePayDialog = ({ onClose }: SubscribePayDialogProps): React.ReactElement => {
  return (
    <Dialog isOpen={true} enforceFocus={false} onClose={onClose} className={cx(css.dialog, css.subscribePayDialog)}>
      <SubscribePayContainer />
    </Dialog>
  )
}

export const useSubscribePayModal = (): UseSubscribePayModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    function onCloseModal(): void {
      hideModal()
    }

    return <SubscribePayDialog onClose={onCloseModal} />
  })

  return {
    openSubscribePayModal: showModal,
    closeSubscribePayModal: hideModal
  }
}

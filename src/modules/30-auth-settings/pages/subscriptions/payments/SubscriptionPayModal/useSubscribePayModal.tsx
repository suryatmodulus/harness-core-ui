import React, { useEffect, useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useModalHook, Dialog, Layout, useToaster, PageSpinner, PageError } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Editions, LOOKUP_KEYS, PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import {
  useCreateSubscription,
  SubscriptionDetailDTO,
  useUpdateSubscription,
  CustomerDetailDTO,
  SubscriptionDTO,
  useListPaymentMethods
} from 'services/cd-ng/index'
import SubscribeInfo from './SubscribeInfo'
import PaymentInfo from './PaymentInfo'

import css from './SubscriptionPayModal.module.scss'

export interface UseSubscribePayModalReturns {
  openSubscribePayModal: (props: UseSubscribePayModalProps) => void
  closeSubscribePayModal: () => void
}

export interface NewSubscribeProps {
  quantity: number
  priceId?: string
  lookupKey?: LOOKUP_KEYS
}
export interface UseSubscribePayModalProps {
  customerId: string
  newSubscribeProps: NewSubscribeProps[]
  moduleName: ModuleName
  subscribePlanInfo: {
    subscribePlan?: Editions
    services: number
    unitPrices: { count: number; price: number }[]
    unit: PLAN_UNIT
    premiumSupport?: number
  }
  currentPlanInfo: {
    currentPlan: Editions
    services: number
  }
  subscription?: SubscriptionDetailDTO
  customers?: CustomerDetailDTO[]
}

interface SubscribePayContainerProps extends UseSubscribePayModalProps {
  onClose: () => void
}

const SubscribePayContainer = ({
  onClose,
  customerId,
  newSubscribeProps,
  moduleName,
  subscribePlanInfo,
  currentPlanInfo,
  subscription,
  isConfirm,
  setConfirm
}: SubscribePayContainerProps & {
  isConfirm: boolean
  setConfirm: (value: boolean) => void
}): React.ReactElement => {
  const stripePromise = loadStripe(
    'pk_test_51IykZ0Iqk5P9Eha3uhZUAnFuUWzaLLSa2elWpGBCF7uGpDU5rOcuX8PQew7hI947J9Lefh4qmQniY11HyXcUyBXD00aayEoMmU'
  )
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()

  const isUpdate = subscription?.status === 'active'

  const { mutate: createSubscription, loading: creatingSubscription } = useCreateSubscription({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  async function createNewSubscription(): Promise<void> {
    if (isConfirm) {
      if (!isUpdate) {
        try {
          const newSubscription = await createSubscription({
            customerId,
            items: newSubscribeProps,
            moduleType: moduleName as SubscriptionDTO['moduleType']
          })
          setSecret(newSubscription.data?.clientSecret)
        } catch (err) {
          showError(err?.message)
        }
      }
    }
  }

  useEffect(() => {
    createNewSubscription()
  }, [isConfirm])

  useEffect(() => {
    if (isUpdate) {
      setSecret(subscription?.clientSecret)
    }
  }, [isUpdate, subscription])

  const { mutate: updateSubscription, loading: updatingSubscription } = useUpdateSubscription({
    pathParams: {
      subscriptionId: subscription?.subscriptionId
    },
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const {
    data: paymentMethodsData,
    loading: gettingPaymentMethods,
    error: getPaymentMethodsError,
    refetch: getPaymentMethods
  } = useListPaymentMethods({
    queryParams: {
      accountIdentifier: accountId,
      customerId
    }
  })

  const [secret, setSecret] = useState<string | undefined>(undefined)

  if (creatingSubscription || updatingSubscription || gettingPaymentMethods) {
    return <PageSpinner />
  }

  if (getPaymentMethodsError) {
    return <PageError message={getPaymentMethodsError?.message} onClick={() => getPaymentMethods()} />
  }

  const { unit, subscribePlan } = subscribePlanInfo

  return (
    <Layout.Horizontal>
      <SubscribeInfo
        newSubscribeProps={newSubscribeProps}
        moduleName={moduleName}
        unit={unit}
        customerId={customerId}
        subscribePlan={subscribePlan}
        currentPlanInfo={currentPlanInfo}
        showConfirm={!isConfirm}
        setConfirm={setConfirm}
      />
      {isConfirm && secret && (
        <PaymentInfo
          paySources={paymentMethodsData?.data}
          clientSecret={secret}
          subscription={subscription}
          updateSubscription={updateSubscription}
          newSubscribeProps={newSubscribeProps}
          onClose={onClose}
          stripe={stripePromise}
        />
      )}
    </Layout.Horizontal>
  )
}

const SubscribePayDialog = ({
  onClose,
  customerId,
  newSubscribeProps,
  moduleName,
  subscribePlanInfo,
  currentPlanInfo,
  subscription,
  customers
}: SubscribePayContainerProps): React.ReactElement => {
  const [isConfirm, setConfirm] = useState<boolean>(false)
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={onClose}
      className={cx(css.dialog, isConfirm ? css.confirmed : css.unconfirmed)}
    >
      <SubscribePayContainer
        customerId={customerId}
        moduleName={moduleName}
        newSubscribeProps={newSubscribeProps}
        subscribePlanInfo={subscribePlanInfo}
        currentPlanInfo={currentPlanInfo}
        subscription={subscription}
        onClose={onClose}
        customers={customers}
        isConfirm={isConfirm}
        setConfirm={setConfirm}
      />
    </Dialog>
  )
}

export const useSubscribePayModal = (customers?: CustomerDetailDTO[]): UseSubscribePayModalReturns => {
  const [payProps, setPayProps] = useState<UseSubscribePayModalProps>()
  const [showModal, hideModal] = useModalHook(() => {
    function onCloseModal(): void {
      hideModal()
    }

    if (!payProps) {
      return <></>
    }

    const { newSubscribeProps, moduleName, subscribePlanInfo, currentPlanInfo, customerId, subscription } = payProps

    return (
      <SubscribePayDialog
        customerId={customerId}
        moduleName={moduleName}
        subscribePlanInfo={subscribePlanInfo}
        currentPlanInfo={currentPlanInfo}
        onClose={onCloseModal}
        newSubscribeProps={newSubscribeProps}
        subscription={subscription}
        customers={customers}
      />
    )
  }, [payProps])

  const open = useCallback(
    props => {
      setPayProps(props)
      showModal()
    },
    [showModal]
  )

  return {
    openSubscribePayModal: props => open(props),
    closeSubscribePayModal: hideModal
  }
}

import React, { useState, useCallback } from 'react'
import { useModalHook, Dialog, Layout, PageSpinner, PageError } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import type { ModuleName } from 'framework/types/ModuleName'
import { Editions, PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useRetrieveProductPrices, SubscriptionDetailDTO } from 'services/cd-ng'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useGetUsageAndLimit } from '@auth-settings/hooks/useGetUsageAndLimit'
import type { UseSubscribePayModalProps } from '../SubscriptionPayModal/useSubscribePayModal'
import { getPrices, getLookupKeys } from '../paymentUtils'
import SubscriptionToggler from './SubscriptionToggler'
import SubscriptionCalculator from './SubscriptionCalculator'

import css from './SubscriptionCalculatorModal.module.scss'

export interface UseSubscribeCalculatorModalReturns {
  openSubscribeCalculatorModal: (customerId: string) => void
  closeSubscribeCalculatorModal: () => void
}

interface SubscribeCalculatorDialogProps extends UseSubscribeCalculatorModalProps {
  onClose: () => void
  customerId: string
}

interface SubscribeCalculatorContainerProps extends UseSubscribeCalculatorModalProps {
  customerId: string
}

interface SubscribeProps {
  moduleName: ModuleName
  subscribePlan?: Editions
  subscription?: SubscriptionDetailDTO
}
export interface UseSubscribeCalculatorModalProps {
  onReviewChange: (props: UseSubscribePayModalProps) => void
  subscribeProps: SubscribeProps
}

const SubscribeCalculatorContainer = ({
  customerId,
  onReviewChange,
  subscribeProps
}: SubscribeCalculatorContainerProps): React.ReactElement => {
  const { moduleName, subscribePlan, subscription } = subscribeProps
  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation } = useLicenseStore()
  const { usageData, limitData } = useGetUsageAndLimit(moduleName)
  const [unit, setUnit] = useState<PLAN_UNIT>(PLAN_UNIT.MONTHLY)
  const [edition, setEdition] = useState<Editions>(subscribePlan || Editions.TEAM)

  // TO-DO: map to moduleType
  const services = usageData.usage?.ci?.activeCommitters as number
  let limits = limitData.limit?.ci?.totalDevelopers || 0
  if (limits < 0) {
    limits = 10
  }
  const [servicesCount, setServicesCount] = useState<number>(services)

  const currentPlan = licenseInformation[moduleName]?.edition as Editions
  const currentPlanData = {
    currentPlan,
    services: limits
  }
  const {
    data: productPriceData,
    loading: gettingProductPrice,
    error: productPriceError,
    refetch: getProductPrice
  } = useMutateAsGet(useRetrieveProductPrices, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: {
      prices: getLookupKeys(moduleName)
    }
  })

  const { unitPrices, supportPrice, priceId, lookupKey } = getPrices(
    unit,
    edition,
    moduleName,
    servicesCount,
    productPriceData?.data?.prices
  )

  if (gettingProductPrice) {
    return <PageSpinner />
  }

  if (productPriceError) {
    return <PageError message={productPriceError.message} onClick={() => getProductPrice()} />
  }

  const handleReviewChange = (): void => {
    onReviewChange({
      customerId,
      moduleName,
      newSubscribeProps: [
        {
          quantity: servicesCount,
          priceId,
          lookupKey
        }
      ],
      subscribePlanInfo: { subscribePlan, unitPrices, unit, premiumSupport: supportPrice, services: servicesCount },
      currentPlanInfo: currentPlanData,
      subscription
    })
  }

  return subscribePlan ? (
    <Layout.Vertical>
      <SubscriptionToggler
        moduleName={moduleName}
        subscribePlan={subscribePlan}
        currentPlanData={currentPlanData}
        edition={edition}
        setEdition={setEdition}
        setServicesCount={setServicesCount}
      />
      <SubscriptionCalculator
        unitPrices={unitPrices}
        supportPrice={supportPrice}
        onReviewChange={handleReviewChange}
        services={servicesCount}
        unit={unit}
        setUnit={setUnit}
        setServicesCount={setServicesCount}
      />
    </Layout.Vertical>
  ) : (
    <></>
  )
}

const SubscribeCalculatorDialog = ({
  customerId,
  onClose,
  onReviewChange,
  subscribeProps
}: SubscribeCalculatorDialogProps): React.ReactElement => {
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={onClose}
      className={cx(css.dialog, css.subscribeCalculatorDialog)}
    >
      <SubscribeCalculatorContainer
        onReviewChange={onReviewChange}
        subscribeProps={subscribeProps}
        customerId={customerId}
      />
    </Dialog>
  )
}

export const useSubscribeCalculatorModal = ({
  onReviewChange,
  subscribeProps
}: UseSubscribeCalculatorModalProps): UseSubscribeCalculatorModalReturns => {
  const [customerId, setCustomerId] = useState<string>('')
  const [showModal, hideModal] = useModalHook(() => {
    function onCloseModal(): void {
      hideModal()
    }

    return (
      <SubscribeCalculatorDialog
        customerId={customerId}
        onClose={onCloseModal}
        onReviewChange={onReviewChange}
        subscribeProps={subscribeProps}
      />
    )
  }, [customerId])

  const open = useCallback(
    props => {
      setCustomerId(props)
      showModal()
    },
    [showModal]
  )

  return {
    openSubscribeCalculatorModal: props => open(props),
    closeSubscribeCalculatorModal: hideModal
  }
}

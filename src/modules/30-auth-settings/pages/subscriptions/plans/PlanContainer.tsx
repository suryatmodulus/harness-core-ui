import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Layout, PageSpinner, PageError } from '@wings-software/uicore'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import {
  StartTrialDTO,
  useGetLicensesAndSummary,
  useGetEditionActions,
  useListSubscriptions,
  useListCustomers,
  useCreateCustomer
} from 'services/cd-ng'
import { useToaster } from '@common/components'
import type { ListSubscriptionsQueryParams } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { ModuleName } from 'framework/types/ModuleName'
import type { FetchPlansQuery } from 'services/common/services'
import type { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import Plan from './Plan'
import { useGetCustomer } from './planUtils'

type plansType = 'ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans'
interface PlanProps {
  plans: NonNullable<FetchPlansQuery['pricing']>[plansType]
  moduleName: ModuleName
  timeType: PLAN_UNIT
}

const PlanContainer: React.FC<PlanProps> = ({ plans, timeType, moduleName }) => {
  const moduleType = moduleName as StartTrialDTO['moduleType']
  const module = moduleName.toLowerCase() as Module
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const {
    data: actions,
    loading: gettingActions,
    error: actionErrs,
    refetch: refetchActions
  } = useGetEditionActions({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleType
    }
  })

  const {
    data,
    error,
    refetch,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId
  })

  const licenseData = data?.data

  const updatedLicenseInfo = licenseData && {
    ...licenseInformation?.[moduleType],
    ...pick(licenseData, ['licenseType', 'edition']),
    expiryTime: licenseData.maxExpiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseData])

  const {
    data: subscriptionData,
    loading: gettingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useListSubscriptions({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleName as ListSubscriptionsQueryParams['moduleType']
    }
  })

  const {
    data: customerData,
    loading: gettingCustomers,
    refetch: refetchCustomers,
    error: customerError
  } = useListCustomers({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createCustomer } = useCreateCustomer({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { currentUserInfo } = useAppStore()
  const companyName = currentUserInfo.accounts?.find(account => account.uuid === accountId)?.companyName as string

  const existingCustomerId = useGetCustomer(customerData?.data)
  const [customerId, setCustomerId] = useState<string | undefined>(existingCustomerId)
  const { showError } = useToaster()
  useEffect(() => {
    async function setCustomer(): Promise<void> {
      if (!existingCustomerId) {
        try {
          // const newCustomer = await createCustomer({ billingEmail: currentUserInfo.email, companyName })
          // setCustomerId(newCustomer.data?.customerId || '')
        } catch (err) {
          showError(err.data?.message || err?.message)
        }
      } else {
        setCustomerId(existingCustomerId)
      }
    }
    setCustomer()
  }, [existingCustomerId])

  if (gettingLicense || gettingActions || gettingSubscription || gettingCustomers) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={error?.message} onClick={() => refetch()} />
  }

  if (actionErrs) {
    return <PageError message={actionErrs?.message} onClick={() => refetchActions()} />
  }

  if (subscriptionError) {
    return <PageError message={subscriptionError?.message} onClick={() => refetchSubscription()} />
  }

  if (customerError) {
    return <PageError message={customerError?.message} onClick={() => refetchCustomers()} />
  }

  return (
    <Layout.Horizontal spacing="large">
      {customerId &&
        plans?.map(plan => (
          <Plan
            key={plan?.title}
            plan={plan}
            timeType={timeType}
            moduleName={moduleName}
            licenseData={licenseData}
            actionsData={actions?.data}
            subscriptions={subscriptionData?.data}
            customers={customerData?.data}
            customerId={customerId}
          />
        ))}
    </Layout.Horizontal>
  )
}

export default PlanContainer

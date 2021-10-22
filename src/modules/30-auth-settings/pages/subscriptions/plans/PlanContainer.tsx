import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick, cloneDeep } from 'lodash-es'
import { Layout, PageSpinner, PageError } from '@wings-software/uicore'
import { useToaster } from '@common/components'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions, PlanActions } from '@common/constants/TrackingConstants'
import type { FetchPlansQuery } from 'services/common/services'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import {
  useStartTrialLicense,
  StartTrialDTO,
  useGetLicensesAndSummary,
  useStartFreeLicense,
  ResponseModuleLicenseDTO
} from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { ModuleName } from 'framework/types/ModuleName'
import { ModuleLicenseType, Editions } from '@common/constants/SubscriptionTypes'
import { getBtnProps } from './planUtils'
import type { TIME_TYPE } from './Plan'
import Plan from './Plan'

interface PlanProps {
  module: ModuleName
  plans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans']
  timeType: TIME_TYPE
}
export interface PlanCalculatedProps {
  btnProps: {
    buttonText?: string
    btnLoading: boolean
    onClick?: () => void
    isDisabled?: boolean
  }
  currentPlanProps: {
    isCurrentPlan?: boolean
    isTrial?: boolean
    isPaid?: boolean
  }
}

const PlanContainer: React.FC<PlanProps> = ({ plans, timeType, module }) => {
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const history = useHistory()
  const moduleType = module.toUpperCase() as StartTrialDTO['moduleType']
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { mutate: startTrial, loading: startingTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: startFreePlan, loading: startingFreePlan } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleType
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  function startPlanByEdition(edition: Editions): Promise<ResponseModuleLicenseDTO> {
    switch (edition) {
      case Editions.FREE: {
        trackEvent(PlanActions.StartFreeClick, { category: Category.SIGNUP, module, plan: edition })
        return startFreePlan()
      }
      case Editions.ENTERPRISE:
      case Editions.TEAM:
      default: {
        trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module, plan: edition })
        return startTrial({ moduleType, edition })
      }
    }
  }

  async function handleStartPlan(edition: Editions): Promise<void> {
    try {
      const planData = await startPlanByEdition(edition)

      handleUpdateLicenseStore(
        { ...licenseInformation },
        updateLicenseStore,
        module.toLowerCase() as Module,
        planData?.data
      )

      if (module === ModuleName.CE) {
        history.push(routes.toCEOverview({ accountId }))
        return
      }

      let search
      if (licenseData?.licenseType === ModuleLicenseType.TRIAL) {
        search = '?experience=trial&&modal=trial'
      }

      if (edition === Editions.FREE) {
        search = '?experience=free&&modal=free'
      }

      history.push({
        pathname: routes.toModuleHome({ accountId, module: module.toLowerCase() as Module }),
        search
      })
    } catch (ex: any) {
      showError(ex.data?.message)
    }
  }

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
    handleUpdateLicenseStore(
      { ...licenseInformation },
      updateLicenseStore,
      module.toLowerCase() as Module,
      updatedLicenseInfo
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseData])

  function getPlanCalculatedProps(plan: any): PlanCalculatedProps {
    let isCurrentPlan, isTrial, isPaid
    const planEdition = plan?.title?.toUpperCase() as Editions
    if (licenseData?.edition === planEdition) {
      isCurrentPlan = true
    }

    switch (licenseData?.licenseType) {
      case 'PAID':
        isPaid = true
        break
      case 'TRIAL':
        isTrial = true
        break
    }

    const btnProps = getBtnProps(plan, licenseData, getString, handleStartPlan, startingTrial, startingFreePlan)

    return {
      currentPlanProps: {
        isCurrentPlan,
        isTrial,
        isPaid
      },
      btnProps
    }
  }

  const calculatedPlans = cloneDeep(plans)

  calculatedPlans?.map((plan: any) => {
    const calculatedProps = getPlanCalculatedProps(plan)
    const { btnProps, currentPlanProps } = calculatedProps
    plan.btnProps = btnProps
    plan.currentPlanProps = currentPlanProps
  })

  if (gettingLicense) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message} onClick={() => refetch()} />
  }

  return (
    <Layout.Horizontal spacing="large">
      {calculatedPlans?.map((plan: any) => (
        <Plan key={plan?.title} plan={plan} timeType={timeType} module={module} />
      ))}
    </Layout.Horizontal>
  )
}

export default PlanContainer

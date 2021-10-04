import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick, cloneDeep } from 'lodash-es'
import { Layout } from '@wings-software/uicore'
import { useToaster } from '@common/components'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions } from '@common/constants/TrackingConstants'
import type { FetchPlansQuery } from 'services/common/services'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { useStartTrialLicense, StartTrialDTO, useGetLicensesAndSummary } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { TIME_TYPE } from './Plan'
import Plan from './Plan'

interface PlanProps {
  module: ModuleName
  plans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans']
  timeType: TIME_TYPE
}
interface PlanCalculatedProps {
  btnProps: {
    buttonText: string
    btnLoading: boolean
    onClick?: () => void
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
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { mutate: startTrial, loading } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const moduleType = module.toUpperCase() as StartTrialDTO['moduleType']

  async function handleStartTrial(edition: Editions): Promise<void> {
    trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module })
    try {
      const data = await startTrial({ moduleType, edition })

      handleUpdateLicenseStore(
        { ...licenseInformation },
        updateLicenseStore,
        module.toLowerCase() as Module,
        data?.data
      )

      if (module === ModuleName.CE) {
        history.push(routes.toCEOverview({ accountId }))
      } else {
        let search
        if (data.data?.licenseType === ModuleLicenseType.TRIAL) {
          search = '?trial=true'
        }
        history.push({
          pathname: routes.toModuleHome({ accountId, module: module.toLowerCase() as Module }),
          search
        })
      }
    } catch (ex: any) {
      showError(ex.data?.message)
    }
  }

  const {
    data: licenseData,
    error,
    refetch,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId
  })

  const hasLicense = licenseData && licenseData.data
  const { maxExpiryTime: expiryTime, edition, licenseType } = licenseData?.data || {}

  const updatedLicenseInfo = licenseData?.data && {
    ...licenseInformation?.[moduleType],
    ...pick(licenseData?.data, ['licenseType', 'edition']),
    expiryTime
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

  function getBtnProps(plan: any): PlanCalculatedProps['btnProps'] {
    let buttonText, onClick
    const planEdition = plan.title.toUpperCase() as Editions
    if (hasLicense) {
      buttonText = getString('common.deactivate')
      onClick = undefined
    } else {
      buttonText = getString('common.tryNow')
      onClick = () => {
        handleStartTrial(planEdition)
      }
    }
    const btnLoading = loading
    return {
      btnLoading,
      buttonText,
      onClick
    }
  }

  function getPlanCalculatedProps(plan: any): PlanCalculatedProps {
    let isCurrentPlan, isTrial, isPaid
    const planEdition = plan.title.toUpperCase() as Editions
    if (edition === planEdition) {
      isCurrentPlan = true
    }

    if (licenseType === 'TRIAL') {
      isTrial = true
    }

    if (licenseType === 'PAID') {
      isPaid = true
    }

    const btnProps = getBtnProps(plan)

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
    if (plan?.title) {
      const calculatedProps = getPlanCalculatedProps(plan)
      const { btnProps, currentPlanProps } = calculatedProps
      plan.btnProps = btnProps
      plan.currentPlanProps = currentPlanProps
    }
  })

  if (gettingLicense) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
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

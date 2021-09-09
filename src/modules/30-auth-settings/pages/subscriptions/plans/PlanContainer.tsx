import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
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
import type { TIME_TYPE } from './Plan'
import Plan from './Plan'
import css from './Plans.module.scss'

interface PlanProps {
  module: string
  plans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans']
  timeType: TIME_TYPE
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

  const moduleColorMap: Record<string, string> = {
    cd: css.cdColor,
    ce: css.ccmColor,
    cf: css.ffColor,
    ci: css.ciColor
  }

  async function handleStartTrial(): Promise<void> {
    trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module })
    try {
      const data = await startTrial({ moduleType })

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as Module, data?.data)

      history.push({
        pathname: routes.toModuleHome({ accountId, module: module as Module }),
        search: '?trial=true'
      })
    } catch (error) {
      showError(error.data?.message)
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
  const expiryTime = licenseData?.data?.maxExpiryTime

  const updatedLicenseInfo = licenseData?.data && {
    ...licenseInformation?.[moduleType],
    ...pick(licenseData?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as Module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseData])

  plans?.map((plan: any) => {
    if (plan?.title) {
      if (plan.title.trim().toLowerCase() === 'enterprise') {
        if (hasLicense) {
          plan.buttonText = getString('common.deactivate')
          plan.onClick = null
        } else {
          plan.onClick = handleStartTrial
        }
        plan.btnLoading = loading
      }
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
      {plans?.map((plan: any) => (
        <Plan key={plan?.title} plan={plan} timeType={timeType} textColorClassName={moduleColorMap[module]} />
      ))}
    </Layout.Horizontal>
  )
}

export default PlanContainer

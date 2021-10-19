import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { PageSpinner } from '@wings-software/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import StartPlanTemplate from '@common/components/HomePageTemplate/StartPlanTemplate'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useStartPlanModal from '@common/modals/StartPlan/StartPlanModal'
import { Category, PlanActions } from '@common/constants/TrackingConstants'
import { useQueryParams } from '@common/hooks'
import { useStartFreeLicense } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions } from '@common/constants/SubscriptionTypes'
import bgImageURL from './images/cd.svg'

const CDFreeHomePage: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { source } = useQueryParams<{ source?: string }>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { accountId } = useParams<ProjectPathProps>()
  const module = 'cd'
  const moduleType = 'CD'

  const { mutate: startFreePlan, loading } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const startPlannOpenCDPlanModal = async (): Promise<void> => {
    try {
      trackEvent(PlanActions.StartFreeClick, { category: Category.SIGNUP, module, plan: Editions.FREE })
      const data = await startFreePlan()
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)
      history.push({
        pathname: routes.toModuleHome({ accountId, module }),
        search: '?modal=free'
      })
    } catch (ex) {
      showError(ex.data?.message)
    }
  }

  const { showModal: openStartPlanModal } = useStartPlanModal({
    module,
    handleStartPlan: source === 'signup' ? undefined : startPlannOpenCDPlanModal,
    edition: Editions.FREE
  })

  const startPlanProps = {
    description: getString('cd.cdTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cd.learnMore'),
      url: 'https://ngdocs.harness.io/category/c9j6jejsws-cd-quickstarts'
    },
    startBtn: {
      description: source ? getString('common.freePlan.startFreePlan') : getString('getStarted'),
      onClick: source ? undefined : openStartPlanModal
    }
  }

  useEffect(() => {
    if (source === 'signup') {
      openStartPlanModal()
    }
  }, [openStartPlanModal, source])

  if (loading) {
    return <PageSpinner />
  }

  return (
    <StartPlanTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startPlanProps={startPlanProps}
      module={module}
      edition={Editions.FREE}
    />
  )
}

export default CDFreeHomePage

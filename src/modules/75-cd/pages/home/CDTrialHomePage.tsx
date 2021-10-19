import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { PageSpinner } from '@wings-software/uicore'
import StartPlanTemplate from '@rbac/components/HomePageTemplate/StartPlanTemplate'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useStartTrialModal from '@common/modals/StartPlan/StartPlanModal'
import { useQueryParams } from '@common/hooks'
import { useStartTrialLicense } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions } from '@common/constants/SubscriptionTypes'
import bgImageURL from './images/cd.svg'

const CDTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { source } = useQueryParams<{ source?: string }>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { accountId } = useParams<ProjectPathProps>()
  const module = 'cd'
  const moduleType = 'CD'

  const {
    error,
    mutate: startTrial,
    loading
  } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const startTrialnOpenCDTrialModal = async (): Promise<void> => {
    const data = await startTrial({ moduleType, edition: Editions.ENTERPRISE })

    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)

    history.push({
      pathname: routes.toModuleHome({ accountId, module }),
      search: '?trial=true&&modal=true'
    })
  }

  const { showModal: openStartTrialModal } = useStartTrialModal({
    module,
    handleStartPlan: source === 'signup' ? undefined : startTrialnOpenCDTrialModal
  })

  const startTrialProps = {
    description: getString('cd.cdTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cd.learnMore'),
      url: 'https://ngdocs.harness.io/category/c9j6jejsws-cd-quickstarts'
    },
    startBtn: {
      description: source ? getString('cd.cdTrialHomePage.startTrial.startBtn.description') : getString('getStarted'),
      onClick: source ? undefined : openStartTrialModal
    }
  }

  useEffect(() => {
    if (source === 'signup') {
      openStartTrialModal()
    }
  }, [openStartTrialModal, source])

  const { showError } = useToaster()

  if (error) {
    showError((error.data as Error)?.message || error.message)
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <StartPlanTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startPlanProps={startTrialProps}
      module={module}
    />
  )
}

export default CDTrialHomePage

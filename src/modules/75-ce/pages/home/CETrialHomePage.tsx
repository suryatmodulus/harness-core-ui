import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStartTrialLicense } from 'services/cd-ng'
import useCreateConnector from '@ce/components/CreateConnector/CreateConnector'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import { useToaster } from '@common/components'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { ModuleName } from 'framework/types/ModuleName'
import { Editions } from '@common/constants/SubscriptionTypes'
import bgImage from './images/cehomebg.svg'

const CETrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const history = useHistory()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { openModal } = useCreateConnector({
    onSuccess: () => {
      history.push(routes.toCEOverview({ accountId }))
    },
    onClose: () => {
      history.push(routes.toCEOverview({ accountId }))
    }
  })

  const { mutate: startTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { showModal, hideModal } = useCETrialModal({
    onContinue: () => {
      hideModal()
      openModal()
    }
  })

  const { showError } = useToaster()

  const handleStartTrial = async (): Promise<void> => {
    try {
      const data = await startTrial({ moduleType: 'CE', edition: Editions.ENTERPRISE })

      const expiryTime = data?.data?.expiryTime

      const updatedLicenseInfo = data?.data && {
        ...licenseInformation?.['CE'],
        ...pick(data?.data, ['licenseType', 'edition']),
        expiryTime
      }

      handleUpdateLicenseStore(
        { ...licenseInformation },
        updateLicenseStore,
        ModuleName.CE.toString() as Module,
        updatedLicenseInfo
      )
      showModal()
    } catch (error) {
      showError(error.data?.message)
    }
  }

  const startTrialProps = {
    description: getString('ce.homepage.slogan'),
    learnMore: {
      description: getString('ce.learnMore'),
      url: 'https://ngdocs.harness.io/article/dvspc6ub0v-create-cost-perspectives'
    },
    startBtn: {
      description: getString('ce.ceTrialHomePage.startTrial.startBtn.description'),
      onClick: handleStartTrial
    }
  }

  return (
    <StartTrialTemplate
      title={getString('common.purpose.ce.continuous')}
      bgImageUrl={bgImage}
      startTrialProps={startTrialProps}
      module="cd"
    />
  )
}

export default CETrialHomePage

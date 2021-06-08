import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStartTrialLicense } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components'
import bgImageURL from './ce-homepage-bg.svg'

const CETrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const history = useHistory()
  const { source } = useQueryParams<{ source?: string }>()
  const { showError } = useToaster()

  const { error, mutate: startTrial, loading } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  async function startTrialAndRouteToModuleHome(): Promise<void> {
    await startTrial({ moduleType: 'CE' })
    history.push({
      pathname: routes.toModuleHome({ accountId, module: 'ce' }),
      search: '?trial=true'
    })
  }

  const { showModal: openStartTrialModal } = useStartTrialModal({
    module: 'ce',
    handleStartTrial: source === 'signup' ? undefined : startTrialAndRouteToModuleHome
  })

  const startTrialProps = {
    description: getString('ce.ceTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ce.learnMore'),
      url: 'https://ngdocs.harness.io/article/34bzscs2y9-ce-placeholder'
    },
    startBtn: {
      description: source ? getString('common.startTrial') : getString('getStarted'),
      onClick: source ? undefined : openStartTrialModal
    }
  }

  useEffect(() => {
    if (source === 'signup') {
      openStartTrialModal()
    }
  }, [openStartTrialModal, source])

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    showError((error.data as Error)?.message || error.message, undefined, 'ce.start.trial.error')
  }

  return (
    <StartTrialTemplate
      title={getString('ce.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="ce"
    />
  )
}

export default CETrialHomePage

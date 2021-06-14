import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import { useQueryParams } from '@common/hooks'
import { useStartTrialLicense } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import bgImageURL from './images/homeIllustration.svg'

const CDTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { source } = useQueryParams<{ source?: string }>()
  const { accountId } = useParams<ProjectPathProps>()

  const { error, mutate: startTrial, loading } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const startTrialnOpenCDTrialModal = async (): Promise<void> => {
    await startTrial({ moduleType: 'CD' })
    history.push({
      pathname: routes.toModuleHome({ accountId, module: 'cd' }),
      search: '?trial=true&&modal=true'
    })
  }

  const { showModal: openStartTrialModal } = useStartTrialModal({
    module: 'cd',
    handleStartTrial: source === 'signup' ? undefined : startTrialnOpenCDTrialModal
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
    <StartTrialTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="cd"
    />
  )
}

export default CDTrialHomePage

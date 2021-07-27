import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
// import { useStartTrialLicense } from 'services/cd-ng'
// import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
// import { PageSpinner } from '@common/components/Page/PageSpinner'
// import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import routes from '@common/RouteDefinitions'
// import { useToaster } from '@common/components'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import type { ModuleName } from 'framework/types/ModuleName'
import useCreateConnector from '@ce/components/CreateConnector/CreateConnector'
import bgImage from './images/cehomebg.svg'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
  refetch?: () => void
}

interface CETrialHomePagePropa {
  trialBannerProps: TrialBannerProps
}

const CETrialHomePage: React.FC<CETrialHomePagePropa> = props => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const history = useHistory()
  // const { source } = useQueryParams<{ source?: string }>()
  // const { showError } = useToaster()

  const { openModal } = useCreateConnector({
    onSuccess: () => {
      history.push(routes.toCEOverview({ accountId }))
    }
  })

  // const {
  //   error,
  //   mutate: startTrial,
  //   loading
  // } = useStartTrialLicense({
  //   queryParams: {
  //     accountIdentifier: accountId
  //   }
  // })

  // async function startTrialAndRouteToModuleHome(): Promise<void> {
  //   await startTrial({ moduleType: 'CE' })
  //   history.push({
  //     pathname: routes.toModuleHome({ accountId, module: 'ce' }),
  //     search: '?trial=true'
  //   })
  // }

  // const { showModal: openStartTrialModal } = useStartTrialModal({
  //   module: 'ce',
  //   handleStartTrial: source === 'signup' ? undefined : startTrialAndRouteToModuleHome
  // })

  // useEffect(() => {
  //   if (source === 'signup') {
  //     openStartTrialModal()
  //   }
  // }, [openStartTrialModal, source])

  // if (loading) {
  //   return <PageSpinner />
  // }

  // if (error) {
  //   showError((error.data as Error)?.message || error.message, undefined, 'ce.start.trial.error')
  // }

  return (
    <HomePageTemplate
      title={getString('ce.ccm')}
      bgImageUrl={bgImage}
      subTitle={getString('ce.homepage.slogan')}
      documentText={getString('ce.learnMore')}
      trialBannerProps={props?.trialBannerProps as TrialBannerProps}
      ctaProps={{
        text: getString('ce.trialCta'),
        onClick: () => {
          openModal()
        }
      }}
      disableAdditionalCta={true}
    />
  )
}

export default CETrialHomePage

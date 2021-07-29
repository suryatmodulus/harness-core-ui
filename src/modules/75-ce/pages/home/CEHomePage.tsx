import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useQueryParams } from '@common/hooks'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import useCreateConnector from '@ce/components/CreateConnector/CreateConnector'
import CETrialHomePage from './CETrialHomePage'
import bgImage from './images/cehomebg.svg'

const CEHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { currentUserInfo, selectedProject, updateAppStore } = useAppStore()

  const { accountId } = useParams<AccountPathProps>()

  const { trial } = useQueryParams<{ trial?: boolean }>()

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  const { openModal } = useCreateConnector({
    onSuccess: () => {
      history.push(routes.toCEOverview({ accountId }))
    }
  })

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CE as any },
    accountIdentifier: accountId
  })

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial])

  function handleSelectProjectFromModal(provider: string): void {
    history.push({
      pathname: routes.toCECOCreateGateway({
        accountId
      }),
      search: `?provider=${provider}`
    })
  }

  function handleRouteToCECO(): void {
    history.push({
      pathname: routes.toCECORules({
        accountId
      })
    })
  }

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (project?: Project) => {
      updateAppStore({ selectedProject: project })
      closeProjectModal()
      showModal()
    }
  })

  function handleOpenProjectModal(): void {
    hideModal()
    openProjectModal()
  }

  const { showModal, hideModal } = useCETrialModal({
    isProjectSelected: Boolean(selectedProject),
    openProjectModal: handleOpenProjectModal,
    routeToCE: handleSelectProjectFromModal,
    onClose: selectedProject ? handleRouteToCECO : undefined
  })

  // const trialInProgressProps = {
  //   description: getString('common.trialInProgressDescription'),
  //   startBtn: {
  //     description: getString('createProject'),
  //     onClick: openProjectModal
  //   }
  // }

  const history = useHistory()

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CE,
    refetch
  }

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    const message = (error?.data as Error)?.message || error?.message
    return <PageError message={message} onClick={() => refetch()} />
  }

  if (createdFromNG && data?.status === 'SUCCESS' && !data.data) {
    return <CETrialHomePage trialBannerProps={trialBannerProps} />
  }

  if (createdFromNG && data && data.data && trial) {
    return <CETrialHomePage trialBannerProps={trialBannerProps} />
  }

  return (
    <HomePageTemplate
      title={getString('ce.ccm')}
      bgImageUrl={bgImage}
      subTitle={getString('ce.homepage.slogan')}
      documentText={getString('ce.learnMore')}
      trialBannerProps={trialBannerProps}
      ctaProps={{
        text: 'Get Started',
        onClick: () => {
          openModal()
        }
      }}
      disableAdditionalCta={true}
    />
  )
}

export default CEHomePage

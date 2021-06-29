import React from 'react'
import { Heading, Layout, Text, Container, Button, Color } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStartTrialLicense, ResponseModuleLicenseDTO, StartTrialDTORequestBody } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions } from '@common/constants/TrackingConstants'
import routes from '@common/RouteDefinitions'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import css from './StartTrialTemplate.module.scss'

interface StartTrialTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  startTrialProps: Omit<StartTrialProps, 'startTrial' | 'module' | 'loading'>
  module: Module
}

interface StartTrialProps {
  description: string
  learnMore: {
    description: string
    url: string
  }
  startBtn: {
    description: string
    onClick?: () => void
  }
  shouldShowStartTrialModal?: boolean
  startTrial: () => Promise<ResponseModuleLicenseDTO>
  module: Module
  loading: boolean
}

const StartTrialComponent: React.FC<StartTrialProps> = startTrialProps => {
  const { description, learnMore, startBtn, shouldShowStartTrialModal, startTrial, module, loading } = startTrialProps
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { showError } = useToaster()
  const { showModal } = useStartTrialModal({ module, handleStartTrial })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  async function handleStartTrial(): Promise<void> {
    trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module: module })
    try {
      const data = await startTrial()

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)

      history.push({
        pathname: routes.toModuleHome({ accountId, module }),
        search: '?trial=true'
      })
    } catch (error) {
      showError(error.data?.message)
    }
  }

  function handleStartButtonClick(): void {
    if (shouldShowStartTrialModal) {
      showModal()
    } else {
      handleStartTrial()
    }
  }

  const { trackEvent } = useTelemetry()
  return (
    <Layout.Vertical spacing="small">
      <Text padding={{ bottom: 'xxlarge' }} width={500}>
        {description}
      </Text>
      <a className={css.learnMore} href={learnMore.url} rel="noreferrer" target="_blank">
        {learnMore.description}
      </a>
      <Button
        width={300}
        height={45}
        intent="primary"
        text={startBtn.description}
        onClick={startBtn.onClick ? startBtn.onClick : handleStartButtonClick}
        disabled={loading}
      />
    </Layout.Vertical>
  )
}

export const StartTrialTemplate: React.FC<StartTrialTemplateProps> = ({
  title,
  bgImageUrl,
  startTrialProps,
  module
}) => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  const startTrialRequestBody: StartTrialDTORequestBody = {
    moduleType: module.toUpperCase() as any
  }

  const { mutate: startTrial, loading } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  function handleStartTrial(): Promise<ResponseModuleLicenseDTO> {
    return startTrial(startTrialRequestBody)
  }

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImageUrl}) no-repeat` }}>
      <Layout.Vertical spacing="medium">
        <Heading font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
          {title}
        </Heading>

        <StartTrialComponent {...startTrialProps} startTrial={handleStartTrial} module={module} loading={loading} />
      </Layout.Vertical>
    </Container>
  )
}

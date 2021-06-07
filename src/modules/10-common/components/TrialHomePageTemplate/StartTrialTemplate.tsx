import React from 'react'
import { Heading, Layout, Text, Container, Button, Color, Icon } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import type { MutateMethod } from 'restful-react'
import { useToaster } from '@common/components'
import { useStartTrialLicense, ResponseModuleLicenseDTO, StartTrialRequestDTO } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions } from '@common/constants/TrackingConstants'
import routes from '@common/RouteDefinitions'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'

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
  startTrial: MutateMethod<ResponseModuleLicenseDTO, void, StartTrialRequestDTO, void>
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

  async function handleStartTrial(): Promise<void> {
    trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module: module })
    try {
      await startTrial()
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
      <Text
        padding={{ bottom: 'xxlarge' }}
        style={{
          width: 500,
          lineHeight: 2
        }}
      >
        {description}
      </Text>
      <a style={{ width: '25%' }} href={learnMore.url} rel="noreferrer" target="_blank">
        {learnMore.description}
      </a>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
        <Button
          style={{
            width: 300,
            height: 45
          }}
          intent="primary"
          text={startBtn.description}
          onClick={startBtn.onClick ? startBtn.onClick : handleStartButtonClick}
        />
        {loading && <Icon name="steps-spinner" size={20} color={Color.BLUE_600} style={{ marginBottom: 7 }} />}
      </Layout.Horizontal>
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

  const startTrialRequestBody: StartTrialRequestDTO = {
    moduleType: module.toUpperCase() as any
  }

  const { mutate: startTrial, loading } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  return (
    <Container
      height="calc(100% - 160px)"
      style={{
        margin: '80px',
        background: `transparent url(${bgImageUrl}) no-repeat`,
        position: 'relative',
        backgroundSize: 'contain',
        backgroundPositionY: 'center'
      }}
    >
      <Layout.Vertical spacing="medium">
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <Heading font={{ weight: 'bold' }} style={{ fontSize: '30px' }} color={Color.BLACK_100}>
            {title}
          </Heading>
        </Layout.Horizontal>

        <StartTrialComponent
          {...startTrialProps}
          startTrial={() => startTrial(startTrialRequestBody)}
          module={module}
          loading={loading}
        />
      </Layout.Vertical>
    </Container>
  )
}

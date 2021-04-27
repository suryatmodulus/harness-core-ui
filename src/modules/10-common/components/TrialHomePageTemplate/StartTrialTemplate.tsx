import React from 'react'
import { Heading, Layout, Text, Container, Button, Color, Icon } from '@wings-software/uicore'
import { Link, useParams, useHistory } from 'react-router-dom'
import type { MutateMethod } from 'restful-react'
import { useToaster } from '@common/components'
import { useStartTrial, RestResponseModuleLicenseInfo, StartTrialRequestBody } from 'services/portal'
import type { Module } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

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
  }
  startTrial: MutateMethod<RestResponseModuleLicenseInfo, void, StartTrialRequestBody, void>
  module: Module
  loading: boolean
}

const StartTrialComponent: React.FC<StartTrialProps> = startTrialProps => {
  const { description, learnMore, startBtn, startTrial, module, loading } = startTrialProps
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { showError } = useToaster()
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
      <Link to={learnMore.url}>{learnMore.description}</Link>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
        <Button
          style={{
            width: 300,
            height: 45
          }}
          intent="primary"
          text={startBtn.description}
          onClick={async () => {
            try {
              await startTrial()
              history.push({
                pathname: routes.toModuleHome({ accountId, module }),
                search: '?trial=true'
              })
            } catch (error) {
              showError(error.message)
            }
          }}
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

  const startTrialRequestBody: StartTrialRequestBody = {
    moduleType: module.toUpperCase()
  }

  const { mutate: startTrial, loading } = useStartTrial({
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
        backgroundSize: 'auto',
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

import React, { useState } from 'react'
import { Heading, Layout, Text, Container, Button, Color, Icon } from '@wings-software/uicore'
import { Link, useParams, useHistory } from 'react-router-dom'
import type { MutateMethod } from 'restful-react'
import type { ModuleName } from 'framework/exports'
import { useStartTrial, RestResponseModuleLicenseInfo, StartTrialRequestBody } from 'services/portal'
import { getHomeLinkByAcctIdAndModuleName } from '../../utils/StringUtils'

interface StartTrialTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  startTrialProps: Omit<StartTrialProps, 'startTrial' | 'module'>
  module: ModuleName
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
  changePlan: {
    description: string
    url: string
  }
  startTrial: MutateMethod<RestResponseModuleLicenseInfo, void, StartTrialRequestBody, void>
  module: ModuleName
}

const StartTrialComponent: React.FC<StartTrialProps> = startTrialProps => {
  const { description, learnMore, startBtn, changePlan, startTrial, module } = startTrialProps
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const { accountId } = useParams()
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
            setIsLoading(true)
            try {
              await startTrial()
              history.push({
                pathname: getHomeLinkByAcctIdAndModuleName(accountId, module),
                search: '?trial=true'
              })
            } catch (e) {
              //TODO: read error msg to display
            } finally {
              setIsLoading(false)
            }
          }}
        />
        {isLoading && <Icon name="steps-spinner" size={20} color={Color.BLUE_600} style={{ marginBottom: 7 }} />}
      </Layout.Horizontal>
      <Link to={changePlan.url}>{changePlan.description}</Link>
    </Layout.Vertical>
  )
}

export const StartTrialTemplate: React.FC<StartTrialTemplateProps> = ({
  title,
  bgImageUrl,
  startTrialProps,
  module
}) => {
  const { accountId } = useParams()

  const startTrialRequestBody: StartTrialRequestBody = {
    accountIdentifier: accountId,
    moduleType: module
  }

  const { mutate: startTrial } = useStartTrial({})

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
        />
      </Layout.Vertical>
    </Container>
  )
}

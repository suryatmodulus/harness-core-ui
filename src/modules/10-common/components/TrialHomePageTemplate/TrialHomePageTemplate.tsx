import React, { useState } from 'react'
import { Heading, Layout, Text, Container, Button, Color, Icon } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { useStrings } from 'framework/exports'

interface TrialHomePageTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  trialInProgressProps: TrialInProgressProps
  startTrialProps: Omit<StartTrialProps, 'setTrial'>
}

interface TrialInProgressProps {
  description: string
  startBtn: {
    description: string
    onClick: () => void
  }
}

interface StartTrialProps {
  description: string
  learnMore: {
    description: string
    url: string
  }
  startBtn: {
    description: string
    onClick: () => boolean
  }
  changePlan: {
    description: string
    url: string
  }
  setTrial: (value: boolean) => void
}

const StartTrialComponent: React.FC<StartTrialProps> = startTrialProps => {
  const { description, learnMore, startBtn, changePlan, setTrial } = startTrialProps
  const [isLoading, setIsLoading] = useState(false)
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
            const success = await startBtn.onClick()
            setTrial(success)
            // setIsLoading(false)
          }}
        />
        {isLoading && <Icon name="steps-spinner" size={20} color={Color.BLUE_600} style={{ marginBottom: 7 }} />}
      </Layout.Horizontal>
      <Link to={changePlan.url}>{changePlan.description}</Link>
    </Layout.Vertical>
  )
}

const TrialInProgressComponent: React.FC<TrialInProgressProps> = trialInProgressProps => {
  const { description, startBtn } = trialInProgressProps
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
      <Button
        style={{
          width: 200,
          height: 45
        }}
        intent="primary"
        text={startBtn.description}
        onClick={startBtn.onClick}
      />
    </Layout.Vertical>
  )
}

export const TrialHomePageTemplate: React.FC<TrialHomePageTemplateProps> = ({
  title,
  bgImageUrl,
  isTrialInProgress = false,
  startTrialProps,
  trialInProgressProps
}) => {
  const [trialInProgress, setTrialInProgress] = useState(isTrialInProgress)
  const { getString } = useStrings()
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
          {trialInProgress && (
            <Text
              style={{
                backgroundColor: 'var(--orange-500)',
                color: Color.WHITE,
                textAlign: 'center',
                width: 120,
                height: 18,
                borderRadius: 3,
                display: 'inline-block'
              }}
            >
              {getString('common.trialInProgress')}
            </Text>
          )}
        </Layout.Horizontal>
        {trialInProgress ? (
          <TrialInProgressComponent {...trialInProgressProps} />
        ) : (
          <StartTrialComponent {...startTrialProps} setTrial={(value: boolean) => setTrialInProgress(value)} />
        )}
      </Layout.Vertical>
    </Container>
  )
}

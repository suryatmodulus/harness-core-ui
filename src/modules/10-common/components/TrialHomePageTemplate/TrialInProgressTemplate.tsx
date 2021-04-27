import React from 'react'
import { Button, Color, Container, Heading, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'

interface TrialInProgressTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  trialInProgressProps: TrialInProgressProps
  module: ModuleName
}

interface TrialInProgressProps {
  description: string
  startBtn: {
    description: string
    onClick: () => void
  }
}

const TrialInProgressComponent: React.FC<TrialInProgressProps> = trialInProgressProps => {
  const { description, startBtn } = trialInProgressProps
  const { getString } = useStrings()
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
      <Layout.Horizontal spacing="small">
        <Button
          style={{
            width: 200,
            height: 45
          }}
          intent="primary"
          text={startBtn.description}
          onClick={startBtn.onClick}
        />
        <Text style={{ fontSize: '16px', color: '#4F5162', padding: '12px' }}>{getString('orSelectExisting')}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const TrialInProgressTemplate: React.FC<TrialInProgressTemplateProps> = ({
  title,
  bgImageUrl,
  trialInProgressProps
}) => {
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
        </Layout.Horizontal>
        <TrialInProgressComponent {...trialInProgressProps} />
      </Layout.Vertical>
    </Container>
  )
}

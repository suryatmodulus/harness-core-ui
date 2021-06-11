import React from 'react'
import { Container, Heading, Layout, Link, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import events from './events.svg'

export const TestFlagInfoView: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container
      width={400}
      padding="xxlarge"
      style={{
        boxShadow: '-8px 0 10px -5px rgb(96 97 112 / 16%)',
        position: 'fixed',
        top: '90px',
        right: 0,
        bottom: '60px',
        zIndex: 0
      }}
    >
      <Layout.Vertical spacing="xxlarge">
        <Heading level={2} style={{ fontWeight: 500, color: '#22222A' }}>
          {getString('cf.onboarding.help.test.heading')}
        </Heading>
        <img width="192" height="163" src={events} style={{ alignSelf: 'center' }} />
        <Container>
          <Text style={{ lineHeight: '20px', color: '#6B6D85' }}>{getString('cf.onboarding.help.test.text1')}</Text>

          <Text margin={{ top: 'medium' }} style={{ lineHeight: '20px', color: '#6B6D85' }}>
            {getString('cf.onboarding.help.test.text2')}
          </Text>
          <Container margin={{ top: 'medium' }}>
            <Link href="https://docs.harness.io" target="_blank" text={getString('cf.onboarding.help.test.readmore')} />
          </Container>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

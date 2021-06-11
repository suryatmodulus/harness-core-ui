import React from 'react'
import { Button, Color, Container, Heading, Intent, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import theBasicsImage from './basics.svg'
import upAndRunningImage from './upAndRunning.svg'
import css from './OnboardingPage.module.scss'

export const OnboardingPage = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const history = useHistory()

  return (
    <Container padding="huge" height="100%" background={Color.WHITE}>
      <Heading
        style={{
          fontSize: '30px',
          fontWeight: 700,
          color: '#22222A',
          lineHeight: '32px'
        }}
      >
        {getString('cf.onboarding.title')}
        <Text
          style={{
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '30px',
            color: '#4F5162'
          }}
        >
          {getString('cf.onboarding.subTitle')}
        </Text>
      </Heading>
      <Container margin={{ top: 'xxxlarge' }}>
        <Container style={{ display: 'grid', justifyContent: 'center', padding: '100px 0' }}>
          <img src={theBasicsImage} />
        </Container>
      </Container>

      <Container margin={{ top: 'xxxlarge' }}>
        <Heading level={2} className={css.h2}>
          {getString('cf.onboarding.upAndRunning')}
        </Heading>
        <Container style={{ display: 'grid', justifyContent: 'center', padding: '100px 0 70px' }}>
          <img src={upAndRunningImage} style={{ transform: 'scale(1.1)' }} />
        </Container>
      </Container>

      <Container style={{ display: 'grid', justifyContent: 'center' }}>
        <Button
          intent={Intent.PRIMARY}
          text={getString('cf.onboarding.tryItOut')}
          large
          style={{ fontWeight: 700 }}
          onClick={() => {
            history.push(routes.toCFOnboardingDetail({ accountId, orgIdentifier, projectIdentifier }))
          }}
        />
      </Container>
    </Container>
  )
}

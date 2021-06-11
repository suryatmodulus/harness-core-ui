import React, { useEffect, useState } from 'react'
import { Container, Text, Heading, Color, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router'
import { Classes, Switch } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import routes from '@common/RouteDefinitions'
import type { ApiKey, FeatureFlagRequestRequestBody } from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { TestFlagInfoView } from './TestFlagInfoView'

export interface TestYourFlagViewProps {
  flagInfo: FeatureFlagRequestRequestBody
  language: PlatformEntry
  apiKey: ApiKey
  environmentIdentifier: string | undefined
  testDone: boolean
  setTestDone: React.Dispatch<React.SetStateAction<boolean>>
}

export const TestYourFlagView: React.FC<TestYourFlagViewProps> = props => {
  const { flagInfo } = props
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: props.environmentIdentifier as string,
    flagIdentifier: flagInfo.identifier
  })
  const [checked, setChecked] = useState(false)
  // const [language, setLanguage] = useState<PlatformEntry | undefined>(props.language)
  // const [apiKey, setApiKey] = useState<ApiKey | undefined>(props.apiKey)

  let link = routes.toCFFeatureFlagsDetail({
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string,
    featureFlagIdentifier: flagInfo.identifier,
    accountId
  })
  link = location.hash.startsWith('#/account/') ? '/#' + link : link

  // TODO: Backend is not ready, simulate testing done by timeout
  useEffect(() => {
    setTimeout(() => {
      props.setTestDone(true)
    }, 15000)
  }, [])

  return (
    <Container height="100%">
      <Container padding="xlarge" width="calc(100% - 765px)" height="calc(100vh - 140px)" style={{ overflow: 'auto' }}>
        <Heading
          level={2}
          style={{
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
            color: '#22222A'
          }}
          padding={{ bottom: 'medium' }}
        >
          {getString('cf.onboarding.listenToEvent')}
        </Heading>
        <Text style={{ color: '#22222A' }}>{getString('cf.onboarding.toggleLabel')}</Text>
        <Container
          margin={{ top: 'xlarge', bottom: 'xlarge' }}
          padding={{ top: 'xlarge', left: 'large', bottom: 'xlarge' }}
          style={{
            border: '1px solid #D9DAE5',
            borderRadius: '8px'
          }}
        >
          <Layout.Horizontal style={{ alignItems: 'center' }}>
            <Switch
              onChange={() => {
                if (checked) {
                  toggleFeatureFlag.off()
                } else {
                  toggleFeatureFlag.on()
                }

                setChecked(!checked)
              }}
              alignIndicator="right"
              className={Classes.LARGE}
              checked={checked}
            />
            <Container padding={{ left: 'large' }}>
              <Text style={{ fontWeight: 600, fontSize: '13px', lineHeight: '20px', color: '#0B0B0D' }}>
                {flagInfo.name}
              </Text>
              <Text>ID: {flagInfo.identifier}</Text>
            </Container>
          </Layout.Horizontal>
        </Container>
        {props.testDone && (
          <>
            <Text style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: '#0B0B0D' }}>
              {getString('cf.onboarding.allSet')}
            </Text>
            <Text margin={{ top: 'small' }}>
              <String stringID="cf.onboarding.tryTarget" vars={{ link }} useRichText />
            </Text>
          </>
        )}
      </Container>
      <Container
        padding="xxlarge"
        style={{
          boxShadow: '-8px 0 10px -5px rgb(96 97 112 / 16%)',
          position: 'fixed',
          top: '90px',
          right: '400px',
          bottom: '60px',
          zIndex: 0
        }}
      >
        <Container
          padding="large"
          style={{ borderRadius: '8px', border: '1px solid #D9DAE6' }}
          background={Color.BLACK}
          width={300}
          height={150}
        >
          <Text font={{ mono: true }} color={Color.WHITE}>
            {getString('cf.onboarding.waitForConnect', {
              message: props.testDone ? getString('cf.onboarding.connected') : ''
            })}
          </Text>
        </Container>
        <Text width={300} margin={{ top: 'large' }}>
          {getString('cf.onboarding.behindTheSenes')}
        </Text>
      </Container>
      <TestFlagInfoView />
    </Container>
  )
}

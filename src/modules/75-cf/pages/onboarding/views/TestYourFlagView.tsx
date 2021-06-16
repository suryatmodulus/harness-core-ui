import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Container, Text, Heading, Color, Layout, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router'
import { Classes, Switch } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import routes from '@common/RouteDefinitions'
import { ApiKey, FeatureFlagRequestRequestBody, useGetAllFeatures } from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { TestFlagInfoView } from './TestFlagInfoView'

const POLLING_INTERVAL_IN_MS = 3000

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
  const queryParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier as string,
      environment: props.environmentIdentifier,
      identifier: flagInfo.identifier,
      metrics: true
    }),
    [projectIdentifier, props.environmentIdentifier, accountId, orgIdentifier, flagInfo.identifier]
  )
  const { data, loading, refetch } = useGetAllFeatures({
    lazy: true,
    queryParams
  })
  const [checked, setChecked] = useState(false)
  const timeoutIdRef = useRef<number>()

  let link = routes.toCFFeatureFlagsDetail({
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string,
    featureFlagIdentifier: flagInfo.identifier,
    accountId
  })
  link = location.hash.startsWith('#/account/') ? '/#' + link : link

  useEffect(() => {
    if (!props.testDone) {
      const pollingFn = (): void => {
        if (!loading) {
          refetch().finally(() => {
            clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)
          })
        } else {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)
        }
      }
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)

      return () => clearTimeout(timeoutIdRef.current)
    }
  }, [loading, refetch, props.testDone])

  useEffect(() => {
    if (!props.testDone && data) {
      if (data.features?.[0].status?.status === 'active') {
        clearTimeout(timeoutIdRef.current)
        props.setTestDone(true)
      }
    }
  }, [props.testDone, data, props])

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
          padding={{ top: 'xlarge' }}
          style={{
            border: '1px solid #D9DAE5',
            borderRadius: '8px'
          }}
        >
          <Layout.Horizontal padding={{ left: 'small', bottom: 'large' }}>
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
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#0B0B0D',
                  alignSelf: 'baseline'
                }}
              >
                {flagInfo.name}
              </Text>
            </Container>
          </Layout.Horizontal>
          {!props.testDone && (
            <Layout.Horizontal
              padding={{ top: 'large', left: 'large', bottom: 'large' }}
              style={{ alignItems: 'center', background: '#F3F3FA', borderTop: '1px solid #D9DAE5' }}
            >
              <Icon name="steps-spinner" size={24} color={Color.BLUE_500} />
              <Text padding={{ left: 'medium' }} style={{ fontSize: '14px' }}>
                {getString('cf.onboarding.listeningToEvent')}
              </Text>
            </Layout.Horizontal>
          )}
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
            <pre style={{ margin: 0 }}>
              {getString('cf.onboarding.waitForConnect', {
                message: props.testDone ? getString('cf.onboarding.connected') : ''
              })}
            </pre>
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

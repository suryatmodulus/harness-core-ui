import React from 'react'
import { Container, Text, Heading, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import type { ApiKey, FeatureFlagRequestRequestBody } from 'services/cf'
import { TestFlagInfoView } from './TestFlagInfoView'

export interface TestYourFlagViewProps {
  flagInfo: FeatureFlagRequestRequestBody
  language: PlatformEntry
  apiKey: ApiKey
}

export const TestYourFlagViewView: React.FC<TestYourFlagViewProps> = _props => {
  // const { flagInfo } = props
  const { getString } = useStrings()
  // const [language, setLanguage] = useState<PlatformEntry | undefined>(props.language)
  // const [apiKey, setApiKey] = useState<ApiKey | undefined>(props.apiKey)

  return (
    <Container height="100%">
      <Container padding="xlarge" width="calc(100% - 400px)" height="calc(100vh - 140px)" style={{ overflow: 'auto' }}>
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
          margin={{ top: 'xlarge' }}
          style={{ borderRadius: '8px', border: '1px solid #D9DAE6' }}
          background={Color.WHITE}
          width={510}
          height={150}
        ></Container>
      </Container>
      <TestFlagInfoView />
    </Container>
  )
}

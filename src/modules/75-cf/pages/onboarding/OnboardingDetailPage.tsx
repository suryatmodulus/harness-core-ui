import React, { useMemo, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Button, Color, Container, FlexExpander, Icon, Intent, Layout, Tab, Tabs, Text } from '@wings-software/uicore'
import { ApiKey, CreateFeatureFlagQueryParams, FeatureFlagRequestRequestBody, useCreateFeatureFlag } from 'services/cf'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { CreateAFlagView } from './views/CreateAFlagView'
import { SetUpYourApplicationView } from './views/SetUpYourApplicationView'
import { TestYourFlagViewView } from './views/TestYourFlagView'
import css from './OnboardingDetailPage.module.scss'

enum TabId {
  CREATE_A_FLAG = 'created-a-flag',
  SET_UP_APP = 'set-up-your-app',
  TEST_YOUR_FLAG = 'test-your-flag'
}

export const OnboardingDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const [selectedTabId, setSelectedTabId] = React.useState<string>(TabId.CREATE_A_FLAG)
  const [flagName, setFlagName] = useState('')
  const [language, setLanguage] = useState<PlatformEntry>()
  const [apiKey, setApiKey] = useState<ApiKey>()
  const flagInfo: FeatureFlagRequestRequestBody = useMemo(
    () => ({
      project: projectIdentifier,
      name: flagName,
      identifier: flagName.toLowerCase().trim().replace(/\s|-/g, '_'),
      kind: 'boolean',
      archived: false,
      variations: [
        { identifier: 'true', name: 'True', value: 'true' },
        { identifier: 'false', name: 'False', value: 'false' }
      ],
      defaultOnVariation: 'true',
      defaultOffVariation: 'false',
      permanent: false
    }),
    [projectIdentifier, flagName]
  )
  const [flagCreated, setFlagCreated] = useState(false)
  const history = useHistory()
  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as CreateFeatureFlagQueryParams
  })

  const switchTab = (tabId: string): void => setSelectedTabId(tabId)
  const onNext = (): void => {
    switch (selectedTabId) {
      case TabId.CREATE_A_FLAG:
        if (!flagCreated) {
          createFeatureFlag(flagInfo)
            .then(() => {
              setFlagCreated(true)
              switchTab(TabId.SET_UP_APP)
            })
            .catch(error => showError(getErrorMessage(error)))
        } else {
          switchTab(TabId.SET_UP_APP)
        }
        break
      case TabId.SET_UP_APP:
        setSelectedTabId(TabId.TEST_YOUR_FLAG)
        break
      case TabId.TEST_YOUR_FLAG:
        history.push(routes.toCFOnboarding({ accountId, orgIdentifier, projectIdentifier }))
        break
    }
  }
  const onPrevious = (): void => {
    switch (selectedTabId) {
      case TabId.CREATE_A_FLAG:
        history.push(routes.toCFOnboarding({ accountId, orgIdentifier, projectIdentifier }))
        break
      case TabId.SET_UP_APP:
        setSelectedTabId(TabId.CREATE_A_FLAG)
        break
      case TabId.TEST_YOUR_FLAG:
        setSelectedTabId(TabId.SET_UP_APP)
        break
    }
  }
  const disableNext = !flagName || (!!flagName && selectedTabId === TabId.SET_UP_APP && !apiKey)

  return (
    <Container height="100%" background={Color.WHITE} className={css.container}>
      <Layout.Horizontal
        spacing="xsmall"
        flex
        padding="large"
        height={40}
        style={{
          background: '#F8FBFE',
          border: '1px solid #E7E7E7'
        }}
      >
        <Link to={routes.toCFOnboarding({ accountId, orgIdentifier, projectIdentifier })}>
          {getString('cf.shared.getStarted')}
        </Link>
        <Text>/</Text>
        <Text>{getString('cf.shared.quickGuide')}</Text>
        <Text>/</Text>
        <FlexExpander />
      </Layout.Horizontal>
      <Container height="calc(100% - 102px)">
        <Tabs
          id="cf-onboarding"
          defaultSelectedTabId={selectedTabId}
          onChange={switchTab}
          selectedTabId={selectedTabId}
          data-tabId={selectedTabId}
        >
          <Tab
            id={TabId.CREATE_A_FLAG}
            panel={
              <CreateAFlagView flagInfo={flagInfo} setFlagName={setFlagName} isCreated={flagCreated} goNext={onNext} />
            }
            title={
              <Text icon={flagCreated ? 'tick-circle' : undefined} iconProps={{ color: Color.GREEN_500, size: 14 }}>
                {getString('cf.onboarding.createAFlag')}
              </Text>
            }
          />
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
          <Tab
            id={TabId.SET_UP_APP}
            title={
              <Text icon={apiKey ? 'tick-circle' : undefined} iconProps={{ color: Color.GREEN_500, size: 14 }}>
                {getString('cf.onboarding.setUpApp')}
              </Text>
            }
            disabled={!flagCreated}
            panel={
              <SetUpYourApplicationView
                flagInfo={flagInfo}
                language={language}
                setLanguage={setLanguage}
                apiKey={apiKey}
                setApiKey={setApiKey}
              />
            }
          />
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
          <Tab
            id={TabId.TEST_YOUR_FLAG}
            disabled={disableNext}
            title={<Text>{getString('cf.onboarding.testYourFlag')}</Text>}
            panel={
              language && apiKey && <TestYourFlagViewView flagInfo={flagInfo} language={language} apiKey={apiKey} />
            }
          />
        </Tabs>
      </Container>
      <Layout.Horizontal
        spacing="small"
        height={60}
        style={{
          boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
          alignItems: 'center',
          paddingLeft: 'var(--spacing-xlarge)',
          position: 'fixed',
          left: '270px',
          bottom: 0,
          background: 'var(--white)',
          right: 0
        }}
      >
        <Button text={getString('previous')} icon="chevron-left" onClick={onPrevious} />
        <Button
          text={getString(
            selectedTabId === TabId.SET_UP_APP
              ? 'verify'
              : selectedTabId === TabId.TEST_YOUR_FLAG
              ? 'cf.onboarding.backToStart'
              : 'next'
          )}
          rightIcon={selectedTabId === TabId.TEST_YOUR_FLAG ? undefined : 'chevron-right'}
          intent={Intent.PRIMARY}
          disabled={disableNext}
          onClick={onNext}
          loading={isLoadingCreateFeatureFlag}
        />
        <FlexExpander />
      </Layout.Horizontal>
    </Container>
  )
}

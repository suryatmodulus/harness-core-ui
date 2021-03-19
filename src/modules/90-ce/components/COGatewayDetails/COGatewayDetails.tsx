import React, { useState } from 'react'
import { Layout, Tabs, Tab, Button, Container, Icon, Text } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/exports'
import COGatewayConfig from '@ce/components/COGatewayConfig/COGatewayConfig'
import COGatewayAccess from '@ce/components/COGatewayAccess/COGatewayAccess'
import COGatewayReview from '@ce/components/COGatewayReview/COGatewayReview'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import { useSaveService, Service, useAttachTags } from 'services/lw'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import css from './COGatewayDetails.module.scss'
interface COGatewayDetailsProps {
  previousTab: () => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
}
const COGatewayDetails: React.FC<COGatewayDetailsProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [selectedTabId, setSelectedTabId] = useState<string>('configuration')
  const [validConfig, setValidConfig] = useState<boolean>(false)
  const [validAccessSetup, setValidAccessSetup] = useState<boolean>(false)
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false)
  const tabs = ['configuration', 'setupAccess', 'review']
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { mutate: saveGateway } = useSaveService({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })
  const randomString = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
  const tagKey = 'lightwingRule'
  const tagValue = randomString()
  const { mutate: assignFilterTags } = useAttachTags({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      tagKey,
      tagValue
    }
  })
  const onSave = async (): Promise<void> => {
    try {
      setSaveInProgress(true)
      const instanceIDs = props.gatewayDetails.selectedInstances.map(instance => `'${instance.id}'`).join(',')
      await assignFilterTags({
        Text: `id = [${instanceIDs}]` // eslint-disable-line
      })
      const gateway: Service = {
        name: props.gatewayDetails.name,
        org_id: orgIdentifier, // eslint-disable-line
        project_id: projectIdentifier, // eslint-disable-line
        account_identifier: accountId, // eslint-disable-line
        fulfilment: props.gatewayDetails.fullfilment,
        kind: 'instance',
        cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
        idle_time_mins: props.gatewayDetails.idleTimeMins, // eslint-disable-line
        custom_domains: props.gatewayDetails.customDomains ? props.gatewayDetails.customDomains : [], // eslint-disable-line
        // eslint-disable-next-line
        health_check: props.gatewayDetails.healthCheck,
        routing: {
          instance: {
            filter_text: `[tags]\n${tagKey} = "${tagValue}"` // eslint-disable-line
          },
          ports: props.gatewayDetails.routing.ports,
          lb: undefined
        },
        opts: {
          preserve_private_ip: false, // eslint-disable-line
          always_use_private_ip: false // eslint-disable-line
        },
        metadata: props.gatewayDetails.metadata,
        disabled: props.gatewayDetails.disabled,
        match_all_subdomains: props.gatewayDetails.matchAllSubdomains, // eslint-disable-line
        access_point_id: props.gatewayDetails.accessPointID // eslint-disable-line
      }
      if (props.gatewayDetails.id) {
        gateway.id = props.gatewayDetails.id
      }
      const result = await saveGateway({ service: gateway, deps: props.gatewayDetails.deps, apply_now: false }) // eslint-disable-line
      if (result.response) {
        history.push(
          routes.toCECORules({
            orgIdentifier: orgIdentifier as string,
            projectIdentifier: projectIdentifier as string,
            accountId
          })
        )
      }
    } catch (e) {
      setSaveInProgress(false)
      showError(e.data?.errors?.join('\n') || e.data?.message || e.message)
    }
  }
  const nextTab = (): void => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    if (tabIndex == tabs.length - 1) {
      onSave()
    } else if (tabIndex < tabs.length - 1) {
      setSelectedTabId(tabs[tabIndex + 1])
    }
  }
  const previousTab = (): void => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    if (tabIndex > 0) {
      setSelectedTabId(tabs[tabIndex - 1])
    } else {
      props.previousTab()
    }
  }
  const selectTab = (tabId: string) => {
    if (tabId == selectedTabId) {
      return
    }
    const tabIndex = tabs.findIndex(t => t == tabId)
    setSelectedTabId(tabs[tabIndex])
  }
  const getNextButtonText = (): string => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    if (tabIndex == tabs.length - 1) {
      return getString('ce.co.autoStoppingRule.save')
    }
    return getString('next')
  }
  return (
    <Container style={{ overflow: 'scroll', maxHeight: '100vh', backgroundColor: 'var(--white)' }}>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECORules({ orgIdentifier, projectIdentifier, accountId }),
            label: getString('ce.co.breadCrumb.rules')
          },
          {
            url: '',
            label: props.gatewayDetails.name || ''
          }
        ]}
      />
      <Container className={css.detailsTab}>
        <Tabs id="tabsId1" selectedTabId={selectedTabId} onChange={selectTab}>
          <Tab
            id="configuration"
            title={
              <Layout.Horizontal>
                {validConfig ? (
                  <Icon name="tick-circle" className={css.greenSymbol} size={16} />
                ) : (
                  <Icon name="symbol-circle" className={css.symbol} size={16} />
                )}
                <Text className={css.tabTitle}>1. {getString('ce.co.autoStoppingRule.configuration.pageName')}</Text>
              </Layout.Horizontal>
            }
            panel={
              <COGatewayConfig
                gatewayDetails={props.gatewayDetails}
                setGatewayDetails={props.setGatewayDetails}
                valid={validConfig}
                setValidity={setValidConfig}
              />
            }
          />
          <Tab
            id="setupAccess"
            title={
              <Layout.Horizontal>
                {validAccessSetup ? (
                  <Icon name="tick-circle" className={css.greenSymbol} size={16} />
                ) : (
                  <Icon name="symbol-circle" className={css.symbol} size={16} />
                )}
                <Text className={css.tabTitle}>2. {getString('ce.co.autoStoppingRule.setupAccess.pageName')}</Text>
              </Layout.Horizontal>
            }
            panel={
              <COGatewayAccess
                valid={validAccessSetup}
                setValidity={setValidAccessSetup}
                gatewayDetails={props.gatewayDetails}
                setGatewayDetails={props.setGatewayDetails}
              />
            }
          />
          <Tab
            id="review"
            title={
              <Layout.Horizontal>
                {validConfig && validAccessSetup ? (
                  <Icon name="tick-circle" className={css.greenSymbol} size={16} />
                ) : (
                  <Icon name="symbol-circle" className={css.symbol} size={16} />
                )}
                <Text className={css.tabTitle}>3. {getString('review')}</Text>
              </Layout.Horizontal>
            }
            panel={<COGatewayReview gatewayDetails={props.gatewayDetails} setSelectedTabId={setSelectedTabId} />}
          />
        </Tabs>
      </Container>
      <Layout.Horizontal className={css.footer} spacing="medium">
        <Button
          text="Previous"
          icon="chevron-left"
          onClick={() => previousTab()}
          disabled={selectedTabId == tabs[0] && (props.gatewayDetails.id as number) != undefined}
        />
        <Button
          intent="primary"
          text={getNextButtonText()}
          icon="chevron-right"
          onClick={() => nextTab()}
          disabled={
            (selectedTabId == tabs[0] && !validConfig) ||
            (selectedTabId == tabs[1] && !validAccessSetup) ||
            (selectedTabId == tabs[2] && (!validAccessSetup || !validConfig)) ||
            saveInProgress
          }
          loading={saveInProgress}
        />
        {saveInProgress ? <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} /> : null}
      </Layout.Horizontal>
    </Container>
  )
}

export default COGatewayDetails

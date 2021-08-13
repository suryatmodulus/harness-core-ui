import React, { useState } from 'react'
import { Layout, Tabs, Tab, Button, Container, Icon, Text } from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useToaster } from '@common/exports'
import COGatewayConfig from '@ce/components/COGatewayConfig/COGatewayConfig'
import COGatewayAccess from '@ce/components/COGatewayAccess/COGatewayAccess'
import COGatewayReview from '@ce/components/COGatewayReview/COGatewayReview'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useSaveService, Service, RoutingData } from 'services/lw'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { Utils } from '@ce/common/Utils'
import { ASRuleTabs, GatewayKindType } from '@ce/constants'
import { GatewayContextProvider } from '@ce/context/GatewayContext'
import css from './COGatewayDetails.module.scss'

interface COGatewayDetailsProps {
  previousTab: () => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  activeTab?: ASRuleTabs
  isEditFlow: boolean
}
const COGatewayDetails: React.FC<COGatewayDetailsProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [selectedTabId, setSelectedTabId] = useState<string>(props.activeTab ?? ASRuleTabs.CONFIGURATION)
  const [validConfig, setValidConfig] = useState<boolean>(false)
  const [validAccessSetup, setValidAccessSetup] = useState<boolean>(false)
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false)
  const [activeConfigStep, setActiveConfigStep] = useState<{ count?: number; tabId?: string } | null>(null)
  const tabs = [ASRuleTabs.CONFIGURATION, ASRuleTabs.SETUP_ACCESS, ASRuleTabs.REVIEW]
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { mutate: saveGateway } = useSaveService({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onSave = async (): Promise<void> => {
    try {
      setSaveInProgress(true)
      const hasInstances = !_isEmpty(props.gatewayDetails.selectedInstances)
      const isK8sRule = Utils.isK8sRule(props.gatewayDetails)
      const routing: RoutingData = { ports: props.gatewayDetails.routing.ports, lb: undefined }
      if (isK8sRule) {
        routing.k8s = props.gatewayDetails.routing.k8s
      } else if (hasInstances) {
        const instanceIDs = props.gatewayDetails.selectedInstances.map(instance => `'${instance.id}'`).join(',')
        routing.instance = {
          filter_text: `id = [${instanceIDs}]` // eslint-disable-line
        }
      } else {
        routing.instance = {
          filter_text: '', // eslint-disable-line
          scale_group: props.gatewayDetails.routing.instance.scale_group // eslint-disable-line
        }
      }

      const gateway: Service = {
        name: props.gatewayDetails.name,
        org_id: orgIdentifier, // eslint-disable-line
        project_id: projectIdentifier, // eslint-disable-line
        account_identifier: accountId, // eslint-disable-line
        fulfilment: isK8sRule ? 'kubernetes' : props.gatewayDetails.fullfilment || 'ondemand',
        kind: isK8sRule ? GatewayKindType.KUBERNETES : GatewayKindType.INSTANCE,
        cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
        idle_time_mins: props.gatewayDetails.idleTimeMins, // eslint-disable-line
        custom_domains: props.gatewayDetails.customDomains ? props.gatewayDetails.customDomains : [], // eslint-disable-line
        // eslint-disable-next-line
        health_check: props.gatewayDetails.healthCheck,
        routing,
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
        // Rule creation is halted until the access point creation takes place successfully.
        // Informing the user regarding the same
        if (props.gatewayDetails.accessPointData?.status === 'submitted') {
          showSuccess('Rule will take effect once the load balancer creation is successful!!')
        }
        history.push(
          routes.toCECORules({
            accountId
          })
        )
      }
    } catch (e) {
      setSaveInProgress(false)
      showError(e.data?.errors?.join('\n') || e.data?.message || e.message, undefined, 'ce.savegw.error')
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

  const handleReviewDetailsEdit = (tabDetails: {
    id: string
    metaData?: { activeStepCount?: number; activeStepTabId?: string }
  }) => {
    setSelectedTabId(tabDetails.id)
    if (!_isEmpty(tabDetails.metaData)) {
      const activeStepDetails: { count?: number; tabId?: string } = {}
      if (tabDetails.metaData?.activeStepCount) {
        activeStepDetails['count'] = tabDetails.metaData.activeStepCount
      }
      if (tabDetails.metaData?.activeStepTabId) {
        activeStepDetails['tabId'] = tabDetails.metaData.activeStepTabId
      }
      setActiveConfigStep(activeStepDetails)
    }
  }

  return (
    <Container style={{ overflow: 'scroll', maxHeight: '100vh', backgroundColor: 'var(--white)' }}>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECORules({ accountId }),
            label: getString('ce.co.breadCrumb.rules')
          },
          {
            url: '',
            label: props.gatewayDetails.name || ''
          }
        ]}
      />
      <GatewayContextProvider isEditFlow={props.isEditFlow}>
        <Container className={css.detailsTab}>
          <Tabs id="tabsId1" selectedTabId={selectedTabId} onChange={selectTab}>
            <Tab
              id="configuration"
              disabled
              title={
                <Layout.Horizontal>
                  {validConfig ? (
                    <Icon name="tick-circle" className={css.greenSymbol} size={16} />
                  ) : (
                    <Icon name="symbol-circle" className={css.symbol} size={16} />
                  )}
                  <Text className={css.tabTitle}>1. {getString('configuration')}</Text>
                </Layout.Horizontal>
              }
              panel={
                <COGatewayConfig
                  gatewayDetails={props.gatewayDetails}
                  setGatewayDetails={props.setGatewayDetails}
                  valid={validConfig}
                  setValidity={setValidConfig}
                  activeStepDetails={activeConfigStep}
                />
              }
            />
            <Tab
              id="setupAccess"
              disabled
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
                  activeStepDetails={activeConfigStep}
                />
              }
            />
            <Tab
              id="review"
              disabled
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
              panel={<COGatewayReview gatewayDetails={props.gatewayDetails} onEdit={handleReviewDetailsEdit} />}
            />
          </Tabs>
        </Container>
      </GatewayContextProvider>
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
          onClick={() => {
            if (selectedTabId == tabs[0]) trackEvent('VisitedSetupAccessPage', {})
            if (selectedTabId == tabs[1])
              trackEvent('CompletedSetupAccess', props.gatewayDetails.metadata.access_details || {})
            if (selectedTabId == tabs[2]) trackEvent('AutoStoppingRuleCompleted', {})
            nextTab()
          }}
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

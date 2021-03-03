import React, { useState } from 'react'
import { Layout, Tabs, Tab, Button, Container, Icon, Text } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/exports'
import COGatewayConfig from '@ce/components/COGatewayConfig/COGatewayConfig'
import COGatewayAccess from '@ce/components/COGatewayAccess/COGatewayAccess'
import COGatewayReview from '@ce/components/COGatewayReview/COGatewayReview'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import routes from '@common/RouteDefinitions'
import { useSaveService, Service, useAttachTags } from 'services/lw'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import i18n from './COGatewayDetails.i18n'
import css from './COGatewayDetails.module.scss'
interface COGatewayDetailsProps {
  previousTab: () => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
}
const COGatewayDetails: React.FC<COGatewayDetailsProps> = props => {
  const history = useHistory()
  const { showError } = useToaster()
  const [selectedTabId, setSelectedTabId] = useState<string>('configuration')
  const [validConfig, setValidConfig] = useState<boolean>(false)
  const [validAccessSetup, setValidAccessSetup] = useState<boolean>(false)
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
      const { gatewayDetails } = props
      const asgBased = gatewayDetails.routing.instance && gatewayDetails.routing.instance.scale_group != undefined
      if (!asgBased) {
        const instanceIDs = gatewayDetails.selectedInstances.map(instance => `'${instance.id}'`).join(',')
        await assignFilterTags({
          Text: `id = [${instanceIDs}]` // eslint-disable-line
        })
      }
      const gateway: Service = {
        name: gatewayDetails.name,
        org_id: orgIdentifier, // eslint-disable-line
        project_id: projectIdentifier, // eslint-disable-line
        account_identifier: accountId, // eslint-disable-line
        fulfilment: gatewayDetails.fullfilment,
        kind: 'instance',
        cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
        idle_time_mins: gatewayDetails.idleTimeMins, // eslint-disable-line
        custom_domains: gatewayDetails.customDomains ? gatewayDetails.customDomains : [], // eslint-disable-line
        // eslint-disable-next-line
        health_check: gatewayDetails.healthCheck,
        routing: {
          instance: {
            filter_text: `[tags]\n${tagKey} = "${tagValue}"` // eslint-disable-line
          },
          ports: gatewayDetails.routing.ports
        },
        opts: {
          preserve_private_ip: false, // eslint-disable-line
          always_use_private_ip: false // eslint-disable-line
        },
        metadata: gatewayDetails.metadata,
        disabled: gatewayDetails.disabled,
        match_all_subdomains: gatewayDetails.matchAllSubdomains, // eslint-disable-line
        access_point_id: gatewayDetails.accessPointID // eslint-disable-line
      }
      if (asgBased) {
        gateway.routing = {
          instance: {
            scale_group: gatewayDetails.routing.instance.scale_group // eslint-disable-line
          },
          ports: gatewayDetails.routing.ports
        }
      } else {
        gateway.routing = {
          instance: {
            filter_text: `[tags]\n${tagKey} = "${tagValue}"` // eslint-disable-line
          },
          ports: gatewayDetails.routing.ports
        }
      }
      if (gatewayDetails.id) {
        gateway.id = gatewayDetails.id
      }
      const result = await saveGateway({ service: gateway, deps: gatewayDetails.deps, apply_now: false }) // eslint-disable-line
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
      showError(e.data?.message || e.message)
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
      return 'Save Rule'
    }
    return 'Next'
  }
  return (
    <Container style={{ overflow: 'scroll', maxHeight: '100vh', backgroundColor: 'var(--white)' }}>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECODashboard({ orgIdentifier, projectIdentifier, accountId }),
            label: 'Setup'
          },
          {
            url: routes.toCECODashboard({ orgIdentifier, projectIdentifier, accountId }),
            label: 'Autostopping Rules'
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
                <Text className={css.tabTitle}>1. {i18n.configuration}</Text>
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
                <Text className={css.tabTitle}>2. {i18n.setupAccess}</Text>
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
                <Text className={css.tabTitle}>3. {i18n.review}</Text>
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
            (selectedTabId == tabs[2] && (!validAccessSetup || !validConfig))
          }
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default COGatewayDetails

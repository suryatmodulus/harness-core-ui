import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Container, Icon, Layout, Switch, Tabs, Text } from '@wings-software/uicore'
import { Tab } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useToaster } from '@common/exports'
import { HealthCheck, PortConfig, useSecurityGroupsOfInstances } from 'services/lw'
import { portProtocolMap } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ASRuleCreationActiveStep, GatewayDetails } from '../COCreateGateway/models'
import CORoutingTable from '../COGatewayConfig/CORoutingTable'
import COHealthCheckTable from '../COGatewayConfig/COHealthCheckTable'
import css from './COGatewayAccess.module.scss'

interface LBAdvancedConfigurationProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  activeStepDetails?: ASRuleCreationActiveStep | null
}

const LBAdvancedConfiguration: React.FC<LBAdvancedConfigurationProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)

  const [activeConfigTabId, setActiveConfigTabId] = useState<string | undefined>(props.activeStepDetails?.tabId)
  const [routingRecords, setRoutingRecords] = useState<PortConfig[]>(props.gatewayDetails.routing.ports)
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck | null>(props.gatewayDetails.healthCheck)

  const { mutate: getSecurityGroups, loading: loadingSecurityGroups } = useSecurityGroupsOfInstances({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (routingRecords.length) {
      return
    }
    !_isEmpty(props.gatewayDetails.selectedInstances) && fetchInstanceSecurityGroups()
  }, [])

  useEffect(() => {
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      routing: { ...props.gatewayDetails.routing, ports: routingRecords }
    }
    props.setGatewayDetails(updatedGatewayDetails)
  }, [routingRecords])

  const addAllPorts = () => {
    const emptyRecords: PortConfig[] = []
    Object.keys(portProtocolMap).forEach(item => {
      emptyRecords.push({
        protocol: portProtocolMap[+item],
        port: +item,
        action: 'forward',
        target_protocol: portProtocolMap[+item], // eslint-disable-line
        target_port: +item, // eslint-disable-line
        server_name: '', // eslint-disable-line
        redirect_url: '', // eslint-disable-line
        routing_rules: [] // eslint-disable-line
      })
    })
    const routes = [...emptyRecords]
    if (routes.length) setRoutingRecords(routes)
  }

  const fetchInstanceSecurityGroups = async (): Promise<void> => {
    const emptyRecords: PortConfig[] = []
    const hasInstances = !_isEmpty(props.gatewayDetails.selectedInstances)
    try {
      let text = `id = ['${Utils.getConditionalResult(
        hasInstances,
        props.gatewayDetails.selectedInstances?.[0]?.id,
        ''
      )}']\nregions = ['${Utils.getConditionalResult(
        hasInstances,
        props.gatewayDetails.selectedInstances?.[0]?.region,
        ''
      )}']`

      if (isAzureProvider) {
        text += `\nresource_groups=['${Utils.getConditionalResult(
          hasInstances,
          props.gatewayDetails.selectedInstances?.[0]?.metadata?.resourceGroup,
          ''
        )}']`
      }

      const result = await getSecurityGroups({
        text
      })
      if (result && result.response) {
        Object.keys(result.response).forEach(instance => {
          result.response?.[instance].forEach(sg => {
            sg?.inbound_rules?.forEach(rule => {
              if (rule.protocol == '-1' || rule.from === '*') {
                addAllPorts()
                return
              } else if (rule && rule.from && [80, 443].includes(+rule.from)) {
                const fromRule = +rule.from
                const toRule = +(rule.to ? rule.to : 0)
                emptyRecords.push({
                  protocol: portProtocolMap[fromRule],
                  port: fromRule,
                  action: 'forward',
                  target_protocol: portProtocolMap[fromRule], // eslint-disable-line
                  target_port: toRule, // eslint-disable-line
                  server_name: '', // eslint-disable-line
                  redirect_url: '', // eslint-disable-line
                  routing_rules: [] // eslint-disable-line
                })
                const routes = [...emptyRecords]
                if (routes.length) setRoutingRecords(routes)
              }
            })
          })
        })
      }
    } catch (e) {
      showError(e.data?.message || e.message, undefined, 'ce.creaetap.result.error')
    }
  }

  const addPort = () => {
    routingRecords.push({
      protocol: 'http',
      port: 80,
      action: 'forward',
      target_protocol: 'http', // eslint-disable-line
      target_port: 80, // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      server_name: '', // eslint-disable-line
      routing_rules: [] // eslint-disable-line
    })
    const routes = [...routingRecords]
    setRoutingRecords(routes)
  }

  const updateGatewayHealthCheck = (_healthCheckDetails: HealthCheck | null) => {
    const updatedGatewayDetails = { ...props.gatewayDetails, healthCheck: _healthCheckDetails }
    props.setGatewayDetails(updatedGatewayDetails)
  }

  const handleHealthCheckToggle = (toggleStatus: boolean) => {
    const hcData = toggleStatus ? Utils.getDefaultRuleHealthCheck() : null
    setHealthCheckPattern(hcData)
    updateGatewayHealthCheck(hcData)
  }

  const handleUpdatePattern = (_data: HealthCheck) => {
    setHealthCheckPattern(_data)
    updateGatewayHealthCheck(_data)
  }

  return (
    <Container className={css.dnsLinkContainer}>
      <Tabs
        id="tabsId1"
        selectedTabId={activeConfigTabId}
        onChange={tabId => tabId !== activeConfigTabId && setActiveConfigTabId(tabId as string)}
      >
        <Tab
          id="routing"
          title="Routing"
          panel={
            <Container style={{ backgroundColor: '#FBFBFB' }}>
              {!isK8sRule && (
                <>
                  <Text className={css.titleHelpTextDescription}>
                    {getString('ce.co.gatewayConfig.routingDescription')}
                  </Text>
                  <Layout.Vertical spacing="large">
                    {loadingSecurityGroups ? (
                      <Icon
                        name="spinner"
                        size={24}
                        color="blue500"
                        style={{ alignSelf: 'center', marginTop: '10px' }}
                      />
                    ) : (
                      <CORoutingTable routingRecords={routingRecords} setRoutingRecords={setRoutingRecords} />
                    )}
                    <Container className={css.rowItem}>
                      <Text
                        onClick={() => {
                          addPort()
                        }}
                      >
                        {getString('ce.co.gatewayConfig.addPortLabel')}
                      </Text>
                    </Container>
                  </Layout.Vertical>
                </>
              )}
            </Container>
          }
        />
        <Tab
          id="healthcheck"
          title="Health check"
          panel={
            <Container style={{ backgroundColor: '#FBFBFB' }}>
              <Text className={css.titleHelpTextDescription}>
                {getString('ce.co.gatewayConfig.healthCheckDescription')}
              </Text>
              <Layout.Vertical spacing="large" padding="large">
                <Switch
                  label={getString('ce.co.gatewayConfig.healthCheck')}
                  className={css.switchFont}
                  onChange={e => {
                    handleHealthCheckToggle(e.currentTarget.checked)
                  }}
                  checked={!_isEmpty(healthCheckPattern)}
                />
                {healthCheckPattern && (
                  <COHealthCheckTable pattern={healthCheckPattern} updatePattern={handleUpdatePattern} />
                )}
              </Layout.Vertical>
            </Container>
          }
        />
      </Tabs>
    </Container>
  )
}

export default LBAdvancedConfiguration

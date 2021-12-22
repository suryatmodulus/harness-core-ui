import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import { Container, Icon, Layout, Switch, Tabs, Text } from '@wings-software/uicore'
import { Tab } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useToaster } from '@common/exports'
import {
  HealthCheck,
  PortConfig,
  useSecurityGroupsOfInstances,
  NetworkSecurityGroupForInstanceArray
} from 'services/lw'
import { portProtocolMap } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ASRuleCreationActiveStep, GatewayDetails } from '../COCreateGateway/models'
import CORoutingTable from '../COGatewayConfig/CORoutingTable'
import COHealthCheckTable from '../COGatewayConfig/COHealthCheckTable'
import {
  getAllInboundRules,
  getDefinedInboundRules,
  getPortConfig,
  getSecurityGroupsBodyText,
  getDefaultPortConfigs
} from './helper'
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
  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)

  const [activeConfigTabId, setActiveConfigTabId] = useState<string | undefined>(props.activeStepDetails?.tabId)
  const [routingRecords, setRoutingRecords] = useState<PortConfig[]>(props.gatewayDetails.routing.ports)
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck | null>(props.gatewayDetails.healthCheck)
  const [showRoutingTable, setShowRoutingTable] = useState<boolean>(false)

  const { mutate: getSecurityGroups, loading: loadingSecurityGroups } = useSecurityGroupsOfInstances({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (_isEmpty(routingRecords) && !_isEmpty(props.gatewayDetails.selectedInstances)) {
      fetchInstanceSecurityGroups()
    } else {
      setShowRoutingTable(true)
    }
  }, [])

  useEffect(() => {
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      routing: { ...props.gatewayDetails.routing, ports: routingRecords }
    }
    props.setGatewayDetails(updatedGatewayDetails)
  }, [routingRecords])

  const handleSaveRoutingRecords = (data: NetworkSecurityGroupForInstanceArray) => {
    const securityGroups = Object.entries(data).map(([, groups]) => groups)
    const inboundRules = getAllInboundRules(securityGroups)
    const definedRules = getDefinedInboundRules(inboundRules)
    let newRecords = []
    if (!_isEmpty(definedRules)) {
      newRecords = definedRules
        .filter(rule => Object.keys(portProtocolMap).includes(rule.from as string))
        .map(rule =>
          getPortConfig({
            from: Number(rule.from),
            to: _defaultTo(Number(rule.to), 0),
            protocol: portProtocolMap[Number(rule.from)]
          })
        )
    } else {
      newRecords = getDefaultPortConfigs()
    }
    setRoutingRecords(newRecords)
  }

  const fetchInstanceSecurityGroups = async (): Promise<void> => {
    try {
      const result = await getSecurityGroups({
        text: getSecurityGroupsBodyText(props.gatewayDetails)
      })
      if (result && result.response) {
        handleSaveRoutingRecords(result.response)
      }
    } catch (e) {
      showError(e.data?.message || e.message, undefined, 'ce.creaetap.result.error')
    } finally {
      setShowRoutingTable(true)
    }
  }

  const addPort = () => {
    setRoutingRecords(records => [...records, getPortConfig()])
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
                    {!showRoutingTable || loadingSecurityGroups ? (
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

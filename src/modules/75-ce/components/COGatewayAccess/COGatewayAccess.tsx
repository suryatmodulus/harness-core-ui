import React, { useEffect, useState } from 'react'
import {
  Heading,
  Container,
  Layout,
  Checkbox,
  Icon,
  Tabs,
  Tab,
  Button,
  Text,
  HarnessDocTooltip
} from '@wings-software/uicore'
import { isEmpty as _isEmpty, map as _map } from 'lodash-es'
import { Drawer } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import { Utils } from '@ce/common/Utils'
import { useToaster } from '@common/exports'
import { DEFAULT_ACCESS_DETAILS } from '@ce/constants'
import type { Service } from 'services/lw'
import DNSLinkSetup from './DNSLinkSetup'
import SSHSetup from './SSHSetup'
import IPSetup from './IPAddressSetup'
import type { ConnectionMetadata, GatewayDetails } from '../COCreateGateway/models'
// import COFixedDrawer from './COFixedDrawer'
import KubernetesRuleYamlEditor from '../COGatewayConfig/KubernetesRuleYamlEditor'
import { getK8sIngressTemplate } from '../COGatewayConfig/GetK8sYamlSchema'
import { getHelpText, getSelectedTabId, getValidStatusForDnsLink } from './helper'
import css from './COGatewayAccess.module.scss'

interface COGatewayAccessProps {
  valid: boolean
  setValidity: (tab: boolean) => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gw: GatewayDetails) => void
  activeStepDetails?: { count?: number; tabId?: string } | null
  allServices: Service[]
}

const COGatewayAccess: React.FC<COGatewayAccessProps> = props => {
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const [accessDetails, setAccessDetails] = useState<ConnectionMetadata>(
    props.gatewayDetails.opts.access_details // eslint-disable-line
      ? (props.gatewayDetails.opts.access_details as ConnectionMetadata) // eslint-disable-line
      : DEFAULT_ACCESS_DETAILS
  )
  const [selectedTabId, setSelectedTabId] = useState<string>('')
  const [selectedHelpText, setSelectedHelpText] = useState<string>('')
  const [selectedHelpTextSections, setSelectedHelpTextSections] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [yamlData, setYamlData] = useState<Record<any, any>>(
    props.gatewayDetails.routing.k8s?.RuleJson ? JSON.parse(props.gatewayDetails.routing.k8s.RuleJson) : undefined
  )

  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)

  useEffect(() => {
    let validStatus = false

    if (accessDetails.dnsLink.selected) {
      validStatus = getValidStatusForDnsLink(props.gatewayDetails)
    } else {
      validStatus =
        (isK8sRule && !_isEmpty(yamlData)) ||
        accessDetails.ipaddress.selected ||
        accessDetails.ssh.selected ||
        accessDetails.backgroundTasks.selected ||
        accessDetails.rdp.selected
    }
    props.setValidity(validStatus)

    props.setGatewayDetails({
      ...props.gatewayDetails,
      ...(!accessDetails.dnsLink.selected &&
        !_isEmpty(props.gatewayDetails.accessPointData) && { accessPointData: undefined, accessPointID: '' }), // remove Access point details on deselection of dnslink option
      opts: { ...props.gatewayDetails.opts, access_details: accessDetails },
      routing: {
        ...props.gatewayDetails.routing,
        ...(!accessDetails.dnsLink.selected && !_isEmpty(props.gatewayDetails.routing.ports) && { ports: [] }) // empty the ports on deselection of dnslink option & if there were already saved values
      }
    })

    setSelectedTabId(getSelectedTabId(accessDetails))
  }, [
    accessDetails,
    props.gatewayDetails.customDomains,
    props.gatewayDetails.accessPointID,
    props.gatewayDetails.routing.ports,
    yamlData
  ])

  useEffect(() => {
    setSelectedHelpText(getHelpText(selectedTabId))
  }, [selectedTabId])

  useEffect(() => {
    yamlData && syncYamlAndGatewayDetails(yamlData, 'gateway', true)
  }, [
    props.gatewayDetails.name,
    props.gatewayDetails.idleTimeMins,
    props.gatewayDetails.opts.hide_progress_page,
    props.gatewayDetails.deps
  ])

  /**
   * function to update yaml & gatewayDetails with correct information
   * @param _data yaml Data Object
   * @param resourceToUpdateWith name to pick for updation
   * @param disableSuccessMsg enable/disable success message (optional)
   */
  const syncYamlAndGatewayDetails = (
    _data: Record<any, any>,
    resourceToUpdateWith: 'yaml' | 'gateway' = 'yaml',
    disableSuccessMsg?: boolean
  ) => {
    const yamlRuleName = _data?.metadata?.name
    const updatedName = Utils.getHyphenSpacedString(props.gatewayDetails.name)
    let nameToReplace = updatedName
    if (resourceToUpdateWith === 'yaml') {
      nameToReplace = yamlRuleName
    }
    const yamlToSave = {
      ..._data,
      metadata: {
        ..._data.metadata,
        name: nameToReplace,
        annotations: {
          ..._data.metadata.annotations,
          'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_input_headers "AutoStoppingRule: ${nameToReplace}";`
        }
      },
      spec: {
        ..._data?.spec,
        ...(resourceToUpdateWith === 'gateway' && {
          dependencies: Utils.fromServiceToYamlDependencies(props.allServices, props.gatewayDetails.deps)
        })
      }
    }
    setYamlData(yamlToSave)
    const updatedGatewayDetails: GatewayDetails = {
      ...props.gatewayDetails,
      ...(yamlRuleName !== updatedName && { name: Utils.hyphenatedToSpacedString(nameToReplace) }),
      ...(resourceToUpdateWith === 'yaml' && { idleTimeMins: _data?.spec?.idleTimeMins }),
      routing: {
        ...props.gatewayDetails.routing,
        k8s: {
          RuleJson: JSON.stringify(yamlToSave),
          ConnectorID: props.gatewayDetails.metadata.kubernetes_connector_id as string
        }
      },
      ...(resourceToUpdateWith === 'yaml' && {
        deps: Utils.fromYamlToServiceDependencies(props.allServices, _data?.spec?.dependencies)
      })
    }
    props.setGatewayDetails(updatedGatewayDetails)
    !disableSuccessMsg && showSuccess(getString('ce.savedYamlSuccess'))
  }

  const getYamlExistingData = () => {
    return (
      yamlData ||
      getK8sIngressTemplate({
        name: props.gatewayDetails.name,
        idleTime: props.gatewayDetails.idleTimeMins,
        cloudConnectorId: props.gatewayDetails.cloudAccount.id,
        hideProgressPage: props.gatewayDetails.opts.hide_progress_page,
        deps: Utils.fromServiceToYamlDependencies(props.allServices, props.gatewayDetails.deps)
      })
    )
  }

  const tooltipId = isAwsProvider ? 'awsSetupAccess' : 'azureSetupAccess'

  return (
    <Container className={css.page}>
      {/* <COFixedDrawer
        topMargin={86}
        content={
          <COHelpSidebar
            key={selectedHelpTextSections.join()}
            pageName={selectedHelpText}
            activeSectionNames={selectedHelpTextSections}
            customDomain={props.gatewayDetails.customDomains?.join(',')}
            hostName={props.gatewayDetails.hostName}
          />
        }
      /> */}
      <Drawer
        autoFocus={true}
        enforceFocus={true}
        hasBackdrop={true}
        usePortal={true}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
        size="392px"
        style={{
          // top: '85px',
          boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
          height: '100vh',
          overflowY: 'scroll'
        }}
      >
        <Container style={{ textAlign: 'right' }}>
          <Button icon="cross" minimal onClick={_ => setDrawerOpen(false)} />
        </Container>
        <COHelpSidebar
          key={selectedHelpTextSections.join()}
          pageName={selectedHelpText}
          activeSectionNames={selectedHelpTextSections}
          customDomain={props.gatewayDetails.customDomains?.join(',')}
          hostName={props.gatewayDetails.hostName}
        />
      </Drawer>
      <Layout.Vertical spacing="large" padding="medium" style={{ marginLeft: '10px' }}>
        <Layout.Vertical spacing="small" padding="medium">
          <Layout.Horizontal spacing="small">
            <Heading
              level={2}
              font={{ weight: 'semi-bold' }}
              className={css.setupAccessHeading}
              data-tooltip-id={tooltipId}
            >
              {getString('ce.co.autoStoppingRule.setupAccess.pageName')}
              <HarnessDocTooltip tooltipId={tooltipId} useStandAlone={true} />
            </Heading>
          </Layout.Horizontal>
          {/* <Heading level={3} font={{ weight: 'light' }} className={css.setupAccessSubHeading}>
            {getString('ce.co.gatewayAccess.subtitle')}
          </Heading> */}
        </Layout.Vertical>
        {isK8sRule && (
          <Container>
            <Text className={css.titleHelpTextDescription}>
              {getString('ce.co.gatewayConfig.k8sroutingDescription')}
            </Text>
            <KubernetesRuleYamlEditor
              existingData={getYamlExistingData()}
              fileName={
                props.gatewayDetails.name && `${props.gatewayDetails.name.split(' ').join('-')}-autostopping.yaml`
              }
              handleSave={syncYamlAndGatewayDetails}
            />
          </Container>
        )}
        {!isK8sRule && (
          <Layout.Vertical spacing="small" padding="medium">
            <Layout.Horizontal spacing="small">
              <Heading level={3} font={{ weight: 'light' }} className={css.setupAccessSubHeading}>
                {getString('ce.co.gatewayAccess.accessDescription')}
              </Heading>
              <Icon name="info" style={{ cursor: 'pointer' }} onClick={() => setDrawerOpen(true)}></Icon>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="xxxlarge">
              <Layout.Vertical spacing="medium" style={{ paddingLeft: 'var(--spacing-small)' }}>
                <Checkbox
                  id="DNSLink"
                  label="DNS Link"
                  onChange={val => {
                    setAccessDetails({ ...accessDetails, dnsLink: { selected: val.currentTarget.checked } })
                  }}
                  className={css.checkbox}
                  defaultChecked={accessDetails.dnsLink.selected}
                />
                <Checkbox
                  label="SSH / RDP"
                  id="ssh"
                  onChange={val => {
                    setAccessDetails({ ...accessDetails, ssh: { selected: val.currentTarget.checked } })
                  }}
                  className={css.checkbox}
                  defaultChecked={accessDetails.ssh.selected}
                />
              </Layout.Vertical>
              {/* <Layout.Vertical spacing="medium" style={{ paddingLeft: 'var(--spacing-xxlarge)' }}>
              <Checkbox
                label="Background Tasks"
                className={css.checkbox}
                onChange={val => {
                  accessDetails.backgroundTasks.selected = val.currentTarget.checked
                  setAccessDetails(Object.assign({}, accessDetails))
                }}
                defaultChecked={accessDetails.backgroundTasks.selected}
              />
              <Checkbox
                label="IP address"
                className={css.checkbox}
                defaultChecked={accessDetails.ipaddress.selected}
                onChange={val => {
                  accessDetails.ipaddress.selected = val.currentTarget.checked
                  setAccessDetails(Object.assign({}, accessDetails))
                }}
              />
            </Layout.Vertical> */}
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
        {!isK8sRule && (
          <SetupAccessTabs
            gatewayDetails={props.gatewayDetails}
            selectedTabId={selectedTabId}
            accessDetails={accessDetails}
            setSelectedTabId={setSelectedTabId}
            tabComponentsMap={{
              dnsLink: (
                <Tab
                  id="dns"
                  title={getString('ce.co.gatewayAccess.dnsLink')}
                  panel={
                    <DNSLinkSetup
                      gatewayDetails={props.gatewayDetails}
                      setHelpTextSections={setSelectedHelpTextSections}
                      setGatewayDetails={props.setGatewayDetails}
                      onInfoIconClick={() => setDrawerOpen(true)}
                      activeStepDetails={props.activeStepDetails}
                    />
                  }
                ></Tab>
              ),
              ssh: <Tab id="ssh" title={getString('ce.co.gatewayAccess.sshRdp')} panel={<SSHSetup />}></Tab>,
              ipaddress: <Tab id="ip" title={getString('ce.co.gatewayAccess.ip')} panel={<IPSetup />}></Tab>,
              backgroundTasks: (
                <Tab id="bg" title={getString('ce.co.gatewayAccess.backgroundTasks')} panel={<IPSetup />}></Tab>
              ),
              rdp: <Tab id="rdp" title={getString('ce.co.gatewayAccess.rdp')} panel={<IPSetup />}></Tab>
            }}
          />
        )}
      </Layout.Vertical>
    </Container>
  )
}

interface SetupAccessTabsProps {
  gatewayDetails: GatewayDetails
  accessDetails: ConnectionMetadata
  selectedTabId: string
  setSelectedTabId: (id: string) => void
  tabComponentsMap: Record<keyof ConnectionMetadata, JSX.Element>
}

const SetupAccessTabs: React.FC<SetupAccessTabsProps> = props => {
  const { selectedTabId, setSelectedTabId, tabComponentsMap, accessDetails } = props
  return (
    <Container className={css.setupTab}>
      <Tabs id="setupTabs" selectedTabId={selectedTabId} onChange={setSelectedTabId}>
        {_map(tabComponentsMap, (component, id: keyof ConnectionMetadata) => {
          const detail = accessDetails?.[id]
          if (detail?.selected) {
            return component
          }
          return null
        })}
      </Tabs>
    </Container>
  )
}

export default COGatewayAccess

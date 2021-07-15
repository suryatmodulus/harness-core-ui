import React, { useEffect, useState } from 'react'
import { Heading, Container, Layout, Checkbox, Icon, Tabs, Tab, Button, Text } from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Drawer } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import DNSLinkSetup from './DNSLinkSetup'
import SSHSetup from './SSHSetup'
import IPSetup from './IPAddressSetup'
import type { ConnectionMetadata, GatewayDetails } from '../COCreateGateway/models'
// import COFixedDrawer from './COFixedDrawer'
import css from './COGatewayAccess.module.scss'

interface COGatewayAccessProps {
  valid: boolean
  setValidity: (tab: boolean) => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gw: GatewayDetails) => void
}
const COGatewayAccess: React.FC<COGatewayAccessProps> = props => {
  const { getString } = useStrings()
  const [accessDetails, setAccessDetails] = useState<ConnectionMetadata>(
    props.gatewayDetails.metadata.access_details // eslint-disable-line
      ? (props.gatewayDetails.metadata.access_details as ConnectionMetadata) // eslint-disable-line
      : {
          dnsLink: { selected: false },
          ssh: { selected: false },
          rdp: { selected: false },
          backgroundTasks: { selected: false },
          ipaddress: { selected: false }
        }
  )
  const [selectedTabId, setSelectedTabId] = useState<string>('')
  const [selectedHelpText, setSelectedHelpText] = useState<string>('')
  const [selectedHelpTextSections, setSelectedHelpTextSections] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const selectTab = (tabId: string) => {
    setSelectedTabId(tabId)
  }
  const isK8sRule = !_isEmpty(props.gatewayDetails.routing.k8s?.RuleJson)

  useEffect(() => {
    let validStatus = false
    if (accessDetails.dnsLink.selected) {
      // check for custom domains validation
      if (props.gatewayDetails.customDomains?.length) {
        validStatus = props.gatewayDetails.customDomains.every(url =>
          url.match(
            /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
          )
        )
        if (
          !props.gatewayDetails.metadata.custom_domain_providers?.others &&
          !props.gatewayDetails.metadata.custom_domain_providers?.route53?.hosted_zone_id
        ) {
          validStatus = false
        }
      } else {
        validStatus = true
      }
      // checck for valid access point selected
      if (_isEmpty(props.gatewayDetails.accessPointID)) {
        validStatus = false
      }
    } else {
      validStatus =
        isK8sRule ||
        accessDetails.ipaddress.selected ||
        accessDetails.ssh.selected ||
        accessDetails.backgroundTasks.selected ||
        accessDetails.rdp.selected
    }
    props.setValidity(validStatus)

    props.gatewayDetails.metadata.access_details = accessDetails // eslint-disable-line
    props.setGatewayDetails(props.gatewayDetails)
    if (accessDetails.dnsLink.selected) {
      setSelectedTabId('dns')
      return
    }
    if (accessDetails.ssh.selected) {
      setSelectedTabId('ssh')
      return
    }
    if (accessDetails.ipaddress.selected) {
      setSelectedTabId('ip')
      return
    }
    if (accessDetails.rdp.selected) {
      setSelectedTabId('rdp')
      return
    }
    if (accessDetails.backgroundTasks.selected) {
      setSelectedTabId('bg')
      return
    }
    setSelectedTabId('')
  }, [
    accessDetails,
    props.gatewayDetails.customDomains,
    props.gatewayDetails.metadata,
    props.gatewayDetails.accessPointID
  ])

  useEffect(() => {
    let helpTextBase = 'setup-access'
    if (selectedTabId != '') helpTextBase = `${helpTextBase}-${selectedTabId}`
    setSelectedHelpText(helpTextBase)
  }, [selectedTabId])

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
            <Heading level={2} font={{ weight: 'semi-bold' }} className={css.setupAccessHeading}>
              {getString('ce.co.autoStoppingRule.setupAccess.pageName')}
            </Heading>
          </Layout.Horizontal>
          <Heading level={3} font={{ weight: 'light' }} className={css.setupAccessSubHeading}>
            {getString('ce.co.gatewayAccess.subtitle')}
          </Heading>
        </Layout.Vertical>
        {isK8sRule && <Text>{getString('ce.co.autoStoppingRule.setupAccess.noSetupRequired')}</Text>}
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
                    accessDetails.dnsLink.selected = val.currentTarget.checked
                    setAccessDetails(Object.assign({}, accessDetails))
                  }}
                  className={css.checkbox}
                  defaultChecked={accessDetails.dnsLink.selected}
                />
                <Checkbox
                  label="SSH / RDP"
                  id="ssh"
                  onChange={val => {
                    accessDetails.ssh.selected = val.currentTarget.checked
                    setAccessDetails(Object.assign({}, accessDetails))
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
        <Container className={css.setupTab}>
          <Tabs id="setupTabs" selectedTabId={selectedTabId} onChange={selectTab}>
            {accessDetails.dnsLink.selected ? (
              <Tab
                id="dns"
                title={getString('ce.co.gatewayAccess.dnsLink')}
                panel={
                  <DNSLinkSetup
                    gatewayDetails={props.gatewayDetails}
                    setHelpTextSections={setSelectedHelpTextSections}
                    setGatewayDetails={props.setGatewayDetails}
                    onInfoIconClick={() => setDrawerOpen(true)}
                  />
                }
              ></Tab>
            ) : null}
            {accessDetails.ssh.selected ? (
              <Tab id="ssh" title={getString('ce.co.gatewayAccess.sshRdp')} panel={<SSHSetup />}></Tab>
            ) : null}
            {accessDetails.ipaddress.selected ? (
              <Tab id="ip" title={getString('ce.co.gatewayAccess.ip')} panel={<IPSetup />}></Tab>
            ) : null}
            {accessDetails.rdp.selected ? (
              <Tab id="rdp" title={getString('ce.co.gatewayAccess.rdp')} panel={<IPSetup />}></Tab>
            ) : null}
            {accessDetails.backgroundTasks.selected ? (
              <Tab id="bg" title={getString('ce.co.gatewayAccess.backgroundTasks')} panel={<IPSetup />}></Tab>
            ) : null}
          </Tabs>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default COGatewayAccess

import React, { useEffect, useState } from 'react'
import { Heading, Container, Layout, Checkbox, Icon, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import DNSLinkSetup from './DNSLinkSetup'
import SSHSetup from './SSHSetup'
import IPSetup from './IPAddressSetup'
import type { ConnectionMetadata, GatewayDetails } from '../COCreateGateway/models'
import COFixedDrawer from './COFixedDrawer'
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
  const selectTab = (tabId: string) => {
    setSelectedTabId(tabId)
  }

  useEffect(() => {
    let validStatus = false
    if (accessDetails.dnsLink.selected) {
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
    } else {
      validStatus =
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
  }, [accessDetails, props.gatewayDetails.customDomains, props.gatewayDetails.metadata])

  useEffect(() => {
    let helpTextBase = 'setup-access'
    if (selectedTabId != '') helpTextBase = `${helpTextBase}-${selectedTabId}`
    setSelectedHelpText(helpTextBase)
  }, [selectedTabId])
  return (
    <Container className={css.page}>
      <COFixedDrawer
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
      />
      <Layout.Vertical spacing="large" padding="medium" style={{ marginLeft: '10px' }}>
        <Layout.Vertical spacing="small" padding="medium">
          <Layout.Horizontal spacing="small">
            <Heading level={2} font={{ weight: 'semi-bold' }}>
              {getString('ce.co.autoStoppingRule.setupAccess.pageName')}
            </Heading>
          </Layout.Horizontal>
          <Heading level={3} font={{ weight: 'light' }}>
            {getString('ce.co.gatewayAccess.subtitle')}
          </Heading>
        </Layout.Vertical>
        <Layout.Vertical spacing="small" padding="medium">
          <Layout.Horizontal spacing="small">
            <Heading level={3} font={{ weight: 'light' }}>
              {getString('ce.co.gatewayAccess.accessDescription')}
            </Heading>
            <Icon name="info"></Icon>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xxxlarge" style={{ paddingLeft: 'var(--spacing-large)' }}>
            <Layout.Vertical spacing="medium" style={{ paddingLeft: 'var(--spacing-small)' }}>
              <Checkbox
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

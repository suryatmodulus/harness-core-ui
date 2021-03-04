import { Layout, Container, Text, Icon, Color, Heading } from '@wings-software/uicore'
import React, { useState } from 'react'
import { useStrings } from 'framework/exports'
import idleTimeIMG from './images/idleTime.svg'
import spotVSODIMG from './images/spotOD.svg'
import ssh from './images/ssh.svg'
import rdp from './images/rdp.svg'
import bgTasks from './images/bgTasks.svg'
import ip from './images/ip.svg'
import dnsLink from './images/dnsLink.svg'
import providerSelector from './images/providerSelector.svg'

interface COHelpSidebarProps {
  pageName: string
  activeSectionNames: string[]
  customDomain?: string
  hostName?: string
}
const COHelpSidebar: React.FC<COHelpSidebarProps> = props => {
  const [activeSections] = useState<string[]>(props.activeSectionNames)
  const { getString } = useStrings()
  return (
    <Container>
      {props.pageName == 'configuration' ? (
        <Container padding="large">
          <Layout.Vertical padding="medium" spacing="large">
            <Text style={{ fontWeight: 500, fontSize: 'var(--font-size-normal)', lineHeight: '24px' }}>
              <Icon name="info"></Icon> {getString('ce.co.autoStoppingRule.helpText.idleTime.title')}
            </Text>
            <Container flex style={{ justifyContent: 'center', flexGrow: 1 }}>
              <img src={idleTimeIMG} alt="" aria-hidden />
            </Container>
            <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
              {getString('ce.co.autoStoppingRule.helpText.idleTime.description')}
            </Text>
            <Text
              style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
            >
              {getString('ce.co.autoStoppingRule.helpText.readMore')}
            </Text>
            <Text style={{ fontWeight: 500, fontSize: 'var(--font-size-normal)', lineHeight: '24px' }}>
              <Icon name="info"></Icon> {getString('ce.co.autoStoppingRule.helpText.spotVsOD.title')}
            </Text>
            <img src={spotVSODIMG} alt="" aria-hidden />
            <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
              {getString('ce.co.autoStoppingRule.helpText.spotVsOD.description')}
            </Text>
            <Text
              style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
            >
              {getString('ce.co.autoStoppingRule.helpText.readMore')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : null}
      {props.pageName == 'setup-access' ? (
        <Container padding="large">
          <Layout.Vertical padding="medium" spacing="xxlarge">
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={dnsLink} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.info')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={ssh} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.info')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={rdp} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.rdp.info')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={bgTasks} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.bgTasks.info')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={ip} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.ip.info')}
              </Text>
            </Layout.Horizontal>
            <Text
              style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
            >
              {getString('ce.co.autoStoppingRule.helpText.readMore')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : null}
      {props.pageName == 'setup-access-dns' ? (
        <>
          <Container padding="large" background={Color.BLUE_200}>
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Layout.Horizontal spacing="large" padding="medium">
                <img src={dnsLink} alt="" aria-hidden />
                <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.info')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container padding="xsmall">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.title')}
              </Text>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step1.title')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step1.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step3.title')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step3.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              {activeSections.includes('usingCustomDomain') ? (
                <Layout.Horizontal spacing="large">
                  <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                  <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                    <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                      {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step2.title')}
                    </Text>
                    <Text style={{ lineHeight: '20px' }}>
                      {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step2.description')}
                    </Text>
                    {activeSections.includes('dns-others') ? (
                      <>
                        <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                          {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.title')}
                        </Text>
                        <Text style={{ lineHeight: '20px' }}>
                          {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.description')}
                        </Text>
                        <ol style={{ padding: 'var(--spacing-medium)', lineHeight: '45px' }}>
                          <li>
                            <Text style={{ lineHeight: '20px' }}>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step1', {
                                customDomain: props.customDomain
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step2', {
                                hostName: props.hostName
                              })}
                            </Text>
                          </li>
                        </ol>
                        <Container padding="large" background={Color.BLUE_200}>
                          <Layout.Vertical spacing="medium">
                            <Text>{props.customDomain} CNAME </Text>
                            <Text>{props.hostName}</Text>
                          </Layout.Vertical>
                        </Container>
                        <ol start={3} style={{ padding: 'var(--spacing-medium)', lineHeight: '45px' }}>
                          <li>
                            <Text style={{ lineHeight: '20px' }}>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step3', {
                                customDomain: props.customDomain
                              })}
                            </Text>
                          </li>
                        </ol>
                      </>
                    ) : null}
                  </Layout.Vertical>
                </Layout.Horizontal>
              ) : null}
              <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text>
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
      {props.pageName == 'setup-access-ssh' ? (
        <>
          <Container padding="large" background={Color.BLUE_200}>
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Layout.Horizontal spacing="large" padding="medium">
                <img src={ssh} alt="" aria-hidden />
                <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.info')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container padding="large">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.title')}
              </Text>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.download')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text>
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
      {props.pageName == 'provider-selector' ? (
        <>
          <Container padding="large">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Heading level={2}>{'Select Cloud Account'}</Heading>
              <img
                src={providerSelector}
                alt=""
                aria-hidden
                style={{
                  width: '50%',
                  alignSelf: 'center'
                }}
              />
              <Text>{getString('ce.co.autoStoppingRule.providerSelector.helpText.selectProvider')}</Text>
              <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text>
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
    </Container>
  )
}

export default COHelpSidebar

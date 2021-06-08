import React from 'react'
import { Card, Icon, Layout, Tab, Tabs, Text } from '@wings-software/uicore'
import asaasinLogo from './asaasin.svg'
const AsaasinWorkflowPage: React.FC = () => {
  return (
    <>
      <Layout.Vertical
        spacing="large"
        style={{
          justifyContent: 'left',
          alignItems: 'left',
          margin: '20px'
        }}
      >
        <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
          Workflows
        </Text>
        <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
          View and manage your entire SaaS portfolio. Discover cost-saving opportunities and potential compliance and
          security risks.
        </Text>
        <Tabs id={'verticalTabs'} defaultSelectedTabId={'tab1'} vertical>
          <Tab
            id={'tab1'}
            title={'Employee Onboarding'}
            panel={
              <Layout.Vertical>
                <Layout.Horizontal spacing="xxxlarge">
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="service-slack" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ margin: '5px', color: 'var(--grey-350)' }}>
                            Invite them to Slack
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="service-slack" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ margin: '5px', color: 'var(--grey-350)' }}>
                            Invite them to Slack
                          </Text>
                          <Text font="small" style={{ marginLeft: '5px', color: 'var(--grey-350)' }}>
                            Add them to Slack group
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="google" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ marginLeft: '5px', color: 'var(--grey-350)' }}>
                            Add them to G-Suite group
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="xxxlarge">
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="service-datadog" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ margin: '5px', color: 'var(--grey-350)' }}>
                            Invite them to Datadog
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="github" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ margin: '5px', color: 'var(--grey-350)' }}>
                            Invite them to Github
                          </Text>
                          <Text font="small" style={{ marginLeft: '5px', color: 'var(--grey-350)' }}>
                            Add them to Projects
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                  <Card interactive>
                    <div style={{ height: '200px', width: '150px' }}>
                      <Layout.Vertical spacing="large">
                        <div>
                          <Layout.Horizontal spacing="medium">
                            <img src={asaasinLogo} width="40px"></img>
                            <Icon name="chevron-right" size={30} />
                            <Icon name="service-jira" size={30} />
                          </Layout.Horizontal>
                        </div>
                        <div>
                          <Text style={{ marginTop: '5px' }} font="normal">
                            When User Joins
                          </Text>
                          <Text font="small" style={{ marginLeft: '5px', color: 'var(--grey-350)' }}>
                            Add them to Jira
                          </Text>
                        </div>
                      </Layout.Vertical>
                    </div>
                  </Card>
                </Layout.Horizontal>
              </Layout.Vertical>
            }
          />
          <Tab id={'tab2'} title={'Employee Offboarding'} panel={<div>Tab 2 content</div>} disabled />
          <Tab id={'tab3'} title={'License Utilization'} panel={<div>Tab 3 content</div>} disabled />
          <Tab id={'tab3'} title={'Shadow IT Discovery'} panel={<div>Tab 3 content</div>} disabled />
        </Tabs>
      </Layout.Vertical>
    </>
  )
}

export default AsaasinWorkflowPage

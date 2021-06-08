import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Avatar, Button, CardBody, CardSelect, Color, IconName, Layout, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import Table from '@common/components/Table/Table'

import routes from '@common/RouteDefinitions'
import asaasinLogo from './asaasin.svg'
import userData from './saplingData'
import css from './AsaasinHomePage.module.scss'
const providerData: any[] = [
  {
    name: 'Okta',
    value: 'okta',
    icon: 'service-okta'
  },
  {
    name: 'One login',
    value: 'one-login',
    icon: 'service-onelogin'
  },
  {
    name: 'Azure AD',
    value: 'azure-ad',
    icon: 'service-azure'
  }
]
const hrSoftware: any[] = [
  {
    name: 'Sapling',
    value: 'sapling',
    icon: 'https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-31/373504599508_5a9c14b074a4f37942ae_512.png'
  },
  {
    name: 'Workday',
    value: 'workday',
    icon: 'https://toppng.com/uploads/preview/workday-logo-workday-11562888164rljyiqp8zf.png'
  },
  {
    name: 'Rippling',
    value: 'rippling',
    icon: 'https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco/zofsulj3hqgfkung3nkw'
  }
]
const saasData: any[] = [
  {
    name: 'Slack',
    purchased_on: 'January 1st 2017',
    purchased_by: 'Jane Doe',
    annual_spend: '$60000',
    status: 'Connected'
  },
  {
    name: 'Zoom',
    purchased_on: 'January 1st 2017',
    purchased_by: 'Jane Doe',
    annual_spend: '$60000',
    status: 'Connected'
  },
  {
    name: 'Salesforce',
    purchased_on: 'January 1st 2017',
    purchased_by: 'Jane Doe',
    annual_spend: '$60000',
    status: 'Connect'
  }
]
function TableCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Layout.Horizontal>
      <Avatar src={tableProps.row.original.picture}></Avatar>
      <Text lineClamp={3} color={Color.BLACK} style={{ alignSelf: 'center' }}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}
const AsaasinHomePage: React.FC = () => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const history = useHistory()
  const [selectedCard, setSelectedCard] = useState<any | undefined>()
  const [currentSection, setCurrentSection] = useState<string>('default')
  return (
    <>
      {currentSection == 'default' && (
        <Layout.Vertical
          spacing="large"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '220px'
          }}
        >
          <img
            src={asaasinLogo}
            style={{
              height: '80px',
              width: '400px',
              marginRight: '50px'
            }}
          ></img>
          <Text font="large" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
            Harness aSaaSin
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
            Eliminate waste and manage risk in your SaaS portfolio
          </Text>
          <Button
            intent="primary"
            text="Get Started"
            onClick={() => {
              setCurrentSection('sso-selection')
            }}
          />
        </Layout.Vertical>
      )}
      {currentSection == 'sso-selection' && (
        <Layout.Vertical
          spacing="large"
          style={{
            justifyContent: 'left',
            alignItems: 'left',
            paddingTop: '200px',
            marginLeft: '10px'
          }}
        >
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Select your SSO provider
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Link your SSO provider and automatically import the SaaS applications used across your company.
          </Text>
          <Layout.Horizontal spacing="small" style={{ paddingTop: '29px' }}>
            <CardSelect
              data={providerData}
              selected={selectedCard}
              className={css.providersViewGrid}
              onChange={item => {
                setSelectedCard(item)
              }}
              renderItem={item => (
                <Layout.Vertical spacing="small">
                  <CardBody.Icon icon={item.icon as IconName} iconSize={28}></CardBody.Icon>
                </Layout.Vertical>
              )}
              cornerSelected={true}
            ></CardSelect>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.instanceTypeNameGrid}>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              Okta
            </Text>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              One login
            </Text>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              Azure AD
            </Text>
          </Layout.Horizontal>
          <Button
            intent="primary"
            text="Next"
            width="10%"
            onClick={() => {
              setCurrentSection('hr-selection')
            }}
          />
        </Layout.Vertical>
      )}
      {currentSection == 'hr-selection' && (
        <Layout.Vertical
          spacing="large"
          style={{
            justifyContent: 'left',
            alignItems: 'left',
            paddingTop: '200px',
            marginLeft: '10px'
          }}
        >
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Select your HR software
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Link your HR software and automatically import the people in organization.
          </Text>
          <Layout.Horizontal spacing="small" style={{ paddingTop: '29px' }}>
            <CardSelect
              data={hrSoftware}
              selected={selectedCard}
              className={css.providersViewGrid}
              onChange={item => {
                setSelectedCard(item)
              }}
              renderItem={item => (
                <Layout.Horizontal spacing="small">
                  {/* <Card interactive> */}
                  <div>
                    <Layout.Vertical spacing="large">
                      <div>
                        <img src={item.icon} width="40px"></img>
                      </div>
                    </Layout.Vertical>
                  </div>
                  {/* </Card> */}
                </Layout.Horizontal>
              )}
              cornerSelected={true}
            ></CardSelect>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.instanceTypeNameGrid}>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              Sapling
            </Text>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              Workday
            </Text>
            <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
              Rippling
            </Text>
          </Layout.Horizontal>
          <Button
            intent="primary"
            text="Next"
            width="10%"
            onClick={() => {
              setCurrentSection('employee-list')
            }}
          />
        </Layout.Vertical>
      )}
      {currentSection == 'saas-selection' && (
        <Layout.Vertical
          spacing="large"
          style={{
            margin: '20px'
          }}
        >
          <Text font="large" style={{ lineHeight: '24px', width: '760px', marginTop: '20px' }}>
            Connect SaaS Applications
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Here is a list of all the SaaS applications used in your company. Link each tool to get detailed usage and
            spend information, industry benchmarks and more. Connect with Google and other social login tools to
            effectively track Shadow IT.{' '}
          </Text>
          <Table
            //   className={css.instancesTable}
            data={saasData}
            columns={[
              {
                accessor: 'name',
                Header: 'SaaS App',
                width: '35%',
                Cell: TableCell
              },
              {
                accessor: 'purchased_on',
                Header: 'Purchased On',
                width: '15%',
                Cell: TableCell
              },
              {
                accessor: 'purchased_by',
                Header: 'Purchased By',
                width: '15%',
                Cell: TableCell
              },
              {
                accessor: 'annual_spend',
                Header: 'Annual Spend',
                width: '15%',
                Cell: TableCell
              },
              {
                accessor: 'status',
                Header: 'Status',
                width: '15%',
                Cell: TableCell
              }
            ]}
          />
          <Button
            intent="primary"
            text="skip"
            width="10%"
            onClick={() => {
              history.push(
                routes.toAsaasinDashboard({
                  accountId: accountId
                })
              )
            }}
          />
        </Layout.Vertical>
      )}
      {currentSection == 'employee-list' && (
        <Layout.Vertical
          spacing="large"
          style={{
            margin: '20px'
          }}
        >
          <Text font="large" style={{ lineHeight: '24px', width: '760px', marginTop: '20px' }}>
            People
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Here is a list of all People in your organization.
          </Text>
          <Button
            intent="primary"
            text="Next"
            width="10%"
            onClick={() => {
              setCurrentSection('saas-selection')
            }}
          />
          <Layout.Horizontal spacing="xxxlarge" style={{ alignSelf: 'center' }}>
            <Table
              data={userData.slice(0, userData.length / 3)}
              columns={[
                {
                  accessor: 'full_name',
                  Header: '',
                  width: '100%',
                  Cell: NameCell
                }
              ]}
            />
            <Table
              data={userData.slice(userData.length / 3, (2 * userData.length) / 3)}
              columns={[
                {
                  accessor: 'full_name',
                  Header: '',
                  width: '100%',
                  Cell: NameCell
                }
              ]}
            />
            <Table
              data={userData.slice((2 * userData.length) / 3, userData.length)}
              columns={[
                {
                  accessor: 'full_name',
                  Header: '',
                  width: '100%',
                  Cell: NameCell
                }
              ]}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      )}
    </>
  )
}

export default AsaasinHomePage

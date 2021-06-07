import React, { useState } from 'react'
import { Button, CardBody, CardSelect, Color, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import Table from '@common/components/Table/Table'
import type { CellProps } from 'react-table'

import css from './AsaasinHomePage.module.scss'
import routes from '@common/RouteDefinitions'
import { useHistory, useParams } from 'react-router-dom'
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
          {/* <img width="150px" src="https://www.lightwing.io/assets/images/lw-dark.svg"></img> */}
          <Icon name="harness" size={48}></Icon>
          <Text font="large" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
            Harness aSaaSin
          </Text>
          <Text font="normal" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
            Eliminate waste and manage risk in your SaaS portfolio
          </Text>
          <Button
            intent="primary"
            text="Get Staretd"
            icon="plus"
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
            icon="plus"
            width="10%"
            onClick={() => {
              setCurrentSection('saas-selection')
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
            text="Get Staretd"
            icon="plus"
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
    </>
  )
}

export default AsaasinHomePage

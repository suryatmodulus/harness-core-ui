import React from 'react'
import { Avatar, Color, Container, Heading, Layout, Text } from '@wings-software/uicore'
import { Table } from '@common/components'
import type { CellProps } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
const saasData = [
  {
    name: 'Github',
    value: 'github',
    owner: 'Riyas',
    category: 'Engineering',
    annual_spend: 20000.98,
    users: 177,
    wastage: 39,
    icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
  }
]
function NameCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Layout.Horizontal>
      <Avatar src={tableProps.row.original.icon}></Avatar>
      <Text lineClamp={3} color={Color.BLACK} style={{ alignSelf: 'center' }}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}
function TableCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function DollarCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ fontWeight: 'bold' }}>
      ${tableProps.value}
    </Text>
  )
}
function WastageCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ fontWeight: 'bold' }}>
      {tableProps.value}%
    </Text>
  )
}
const AsaasinDashboardPage: React.FC = () => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
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
          SaaS Dashboard
        </Text>
        <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
          View and manage your entire SaaS portfolio. Discover cost-saving opportunities and potential compliance and
          security risks.
        </Text>
        <Layout.Horizontal spacing="xxlarge">
          <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
            <Layout.Vertical spacing="small">
              <Heading level={1} style={{ color: '#05AAB6' }}>
                $1,200,000
              </Heading>
              <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
            </Layout.Vertical>
          </Container>
          <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
            <Layout.Vertical spacing="small">
              <Heading level={1} style={{ color: '#9872e7' }}>
                $300,000
              </Heading>
              <Text style={{ color: '#9872e7' }}>Est. Annual Savings</Text>
            </Layout.Vertical>
          </Container>
          <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
            <Layout.Vertical spacing="small">
              <Heading level={1} style={{ color: '#05AAB6' }}>
                384
              </Heading>
              <Text style={{ color: '#05AAB6' }}>Total Users</Text>
            </Layout.Vertical>
          </Container>
          <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
            <Layout.Vertical spacing="small">
              <Heading level={1} style={{ color: '#9872e7' }}>
                105
              </Heading>
              <Text style={{ color: '#9872e7' }}>SaaS Application</Text>
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
        <Table
          data={saasData}
          onRowClick={(e, index) => {
            history.push(
              routes.toAsaasinSaaSDashboard({
                accountId: accountId,
                saasApp: e.value
              })
            )
            console.log({ e }, { index })
          }}
          columns={[
            {
              accessor: 'name',
              Header: 'Application',
              width: '20%',
              Cell: NameCell
            },
            {
              accessor: 'owner',
              Header: 'Owner',
              width: '10%',
              Cell: TableCell
            },
            {
              accessor: 'category',
              Header: 'Category',
              width: '15%',
              Cell: TableCell
            },
            {
              accessor: 'annual_spend',
              Header: 'Annual Spend',
              width: '15%',
              Cell: DollarCell
            },
            {
              accessor: 'users',
              Header: 'Users',
              width: '10%',
              Cell: TableCell
            },
            {
              accessor: 'wastage',
              Header: 'Wastage',
              width: '15%',
              Cell: WastageCell
            }
          ]}
        />
      </Layout.Vertical>
    </>
  )
}

export default AsaasinDashboardPage

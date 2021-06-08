import React from 'react'
import { Avatar, Color, Container, Heading, Layout, Text } from '@wings-software/uicore'
import { Table } from '@common/components'
import type { CellProps } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
import { AllStat, AllStatsResponse, useAllStatusOfApplications } from 'services/asaasin'
import { getNodePath } from 'jsonc-parser'
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
      ${tableProps.value.toLocaleString()}
    </Text>
  )
}
function WastageCell(tableProps: CellProps<any>): JSX.Element {
  let total = tableProps.row.original.total_users
  let inactive = tableProps.row.original.inactive_users
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ fontWeight: 'bold' }}>
      {Math.round((inactive / total) * 100)}%
    </Text>
  )
}
function getAnnualSpend(details: AllStatsResponse): number {
  let spend = 0
  details.forEach(r => {
    spend += r.annual_spend as number
  })
  return spend
}
function getAnnualSavings(details: AllStatsResponse): number {
  let spend = 0
  details.forEach(r => {
    spend += r.annual_savings as number
  })
  return spend
}

function getPath(name: string): string {
  switch (name) {
    case 'Github':
      return 'github'
    case 'Pager Duty':
      return 'pagerduty'
    case 'Atlassian - Jira':
      return 'atlassian'
  }
  return ''
}

const AsaasinDashboardPage: React.FC = () => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { data: details, loading: loading } = useAllStatusOfApplications({
    debounce: 300
  })
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
        {!loading && details != null && (
          <Layout.Horizontal
            spacing="xxlarge"
            style={{
              padding: '5%'
            }}
          >
            <Container
              padding="small"
              style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)', minWidth: '20%' }}
            >
              <Layout.Vertical spacing="small">
                <Heading level={1} style={{ color: '#05AAB6' }}>
                  ${getAnnualSpend(details).toLocaleString()}
                </Heading>
                <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
              </Layout.Vertical>
            </Container>
            <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd', minWidth: '20%' }}>
              <Layout.Vertical spacing="small">
                <Heading level={1} style={{ color: '#9872e7' }}>
                  ${getAnnualSavings(details).toLocaleString()}
                </Heading>
                <Text style={{ color: '#9872e7' }}>Est. Annual Savings</Text>
              </Layout.Vertical>
            </Container>
            <Container
              padding="small"
              style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)', minWidth: '20%' }}
            >
              <Layout.Vertical spacing="small">
                <Heading level={1} style={{ color: '#05AAB6' }}>
                  392
                </Heading>
                <Text style={{ color: '#05AAB6' }}>Total Users</Text>
              </Layout.Vertical>
            </Container>
            <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd', minWidth: '20%' }}>
              <Layout.Vertical spacing="small">
                <Heading level={1} style={{ color: '#9872e7' }}>
                  105
                </Heading>
                <Text style={{ color: '#9872e7' }}>SaaS Applications</Text>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        )}
        {!loading && details != null && (
          <Table
            data={details as AllStat[]}
            onRowClick={(e, index) => {
              history.push(
                routes.toAsaasinSaaSDashboard({
                  accountId: accountId,
                  saasApp: getPath(e.name)
                })
              )
            }}
            columns={[
              {
                accessor: 'name',
                Header: 'Application',
                width: '20%',
                Cell: NameCell
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
                accessor: 'annual_savings',
                Header: 'Annual Savings',
                width: '15%',
                Cell: DollarCell
              },
              {
                accessor: 'total_users',
                Header: 'Users',
                width: '10%',
                Cell: TableCell
              },
              {
                accessor: 'inactive_users',
                Header: 'Wastage',
                width: '15%',
                Cell: WastageCell
              }
            ]}
          />
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinDashboardPage

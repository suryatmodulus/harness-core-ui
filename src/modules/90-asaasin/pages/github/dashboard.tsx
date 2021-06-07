import React from 'react'
import { Avatar, Color, Container, Heading, Icon, Layout, Text } from '@wings-software/uicore'
import { useAllGithubUsers } from 'services/asaasin'
import { Table } from '@common/components'
import type { CellProps } from 'react-table'

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
      <Avatar src={tableProps.row.original.avatar_url}></Avatar>
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}

const AsaasinGitHubDashboardPage: React.FC = () => {
  const { data: users, loading: loading } = useAllGithubUsers({
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
        <Layout.Horizontal spacing="xxlarge">
          <Icon name="service-github" size={48}></Icon>
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Github
          </Text>
        </Layout.Horizontal>

        <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
          View and manage your entire Github licenses, users, payments, policies and contracts in one place.
        </Text>

        {!loading && users != null && (
          <>
            <Layout.Horizontal spacing="xxlarge">
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    {Math.floor(users.length * 0.7)}
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Active Users</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    ${users.length * 4 * 12}
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    ${users.length * 4 * 12 * 0.3}
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Potential Savings</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    {99.98}%
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Uptime last quarter</Text>
                </Layout.Vertical>
              </Container>
            </Layout.Horizontal>
            <Table
              //   className={css.instancesTable}
              data={users}
              columns={[
                {
                  accessor: 'id',
                  Header: 'ID',
                  width: '15%',
                  Cell: TableCell
                },
                {
                  accessor: 'login',
                  Header: 'Username',
                  width: '25%',
                  Cell: NameCell
                }
              ]}
            />
          </>
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinGitHubDashboardPage

import React from 'react'
import { Avatar, Color, Container, Heading, Icon, Layout, Text } from '@wings-software/uicore'
import { useGithubDetails, GithubDetailsResponse } from 'services/asaasin'
import { Table } from '@common/components'
import type { CellProps } from 'react-table'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'

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

function getEstimatedSavings(details: GithubDetailsResponse): number {
  let inactive_members = details?.inactive_members.length
  let unused_seats = 0
  let rarely_active_members = details?.rarely_active_members.length
  if (details?.org?.plan?.seats != null && details?.org?.plan?.filled_seats != null) {
    unused_seats = details.org.plan.seats - details.org.plan.filled_seats
  }
  console.log({ inactive_members }, { unused_seats }, { rarely_active_members })
  return (inactive_members + rarely_active_members + unused_seats) * 4 * 12
}

function getActiveUSers(details: GithubDetailsResponse): number {
  let inactive_members = details?.inactive_members.length
  let rarely_active_members = details?.rarely_active_members.length
  return details.members.length - (inactive_members + rarely_active_members)
}

function getInactiveUsers(details: GithubDetailsResponse): number {
  return details?.inactive_members.length
}
function getRarelyActiveUsers(details: GithubDetailsResponse): number {
  return details?.rarely_active_members.length
}
function getUnusedSeats(details: GithubDetailsResponse): number {
  let unused_seats = 0
  if (details?.org?.plan?.seats != null && details?.org?.plan?.filled_seats != null) {
    unused_seats = details.org.plan.seats - details.org.plan.filled_seats
  }
  return unused_seats
}
function getAnnualSpend(details: GithubDetailsResponse): number {
  return details.members.length * 4 * 12
}

function getUtilisationChart(details: GithubDetailsResponse): Highcharts.Options {
  const defaultOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      plotBackgroundColor: '',
      width: 320,
      plotBorderWidth: 0,
      plotShadow: false,
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0]
    },
    title: {
      text: 'Licenses Breakdown'
    },
    credits: { enabled: false },
    tooltip: {
      useHTML: true,
      padding: 4,
      formatter: function () {
        const { point } = this as { point: { name: string; y: number } }
        return `${point.name}: ${point.y}`
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false,
          format: '<b>{point.name}</b>: {point.y:.1f}'
        },
        states: {
          hover: {
            halo: null
          }
        }
      }
    },
    series: [
      {
        type: 'pie',
        colorByPoint: true,
        data: [
          {
            name: 'Active',
            y: getActiveUSers(details)
          },
          {
            name: 'Inactive',
            y: getInactiveUsers(details)
          },
          {
            name: 'Rarely Active',
            y: getRarelyActiveUsers(details)
          },
          {
            name: 'Unused',
            y: getUnusedSeats(details)
          }
        ]
      }
    ]
  }
  return defaultOptions
}

const AsaasinGitHubDashboardPage: React.FC = () => {
  const { data: details, loading: loading } = useGithubDetails({
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

        {!loading && details != null && (
          <>
            <Layout.Horizontal
              style={{
                paddingTop: '20px',
                backgroundColor: Color.WHITE,
                alignItems: 'center'
              }}
              spacing="xxlarge"
            >
              <Layout.Vertical>
                <HighchartsReact highcharts={Highcharts} options={getUtilisationChart(details)}></HighchartsReact>
              </Layout.Vertical>
              <Layout.Vertical>
                <Layout.Horizontal
                  spacing="xxlarge"
                  style={{
                    padding: '20px',
                    marginLeft: '150px'
                  }}
                >
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {getActiveUSers(details)}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Active Users</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        ${getAnnualSpend(details)}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        ${getEstimatedSavings(details)}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Potential Savings</Text>
                    </Layout.Vertical>
                  </Container>
                </Layout.Horizontal>

                <Layout.Horizontal
                  spacing="xxlarge"
                  style={{
                    padding: '20px',
                    marginLeft: '150px'
                  }}
                >
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {details.org?.public_repos}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Public Repos</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {details.org?.total_private_repos}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Private Repos</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {99.98}%
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Uptime last quarter</Text>
                    </Layout.Vertical>
                  </Container>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
            {details.inactive_members.length && (
              <>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Inactive Users ({details.inactive_members.length}/{details.members.length})
                </Text>
                <Container
                  style={{
                    overflowY: 'scroll',
                    maxHeight: '30vh',
                    padding: '20px'
                  }}
                >
                  <Table
                    //   className={css.instancesTable}
                    data={details.inactive_members}
                    columns={[
                      {
                        accessor: 'login',
                        Header: 'Username',
                        width: '25%',
                        Cell: NameCell
                      },
                      {
                        accessor: 'contributions',
                        Header: 'Number of contributions',
                        width: '15%',
                        Cell: TableCell
                      }
                    ]}
                  />
                </Container>
              </>
            )}
            {details.rarely_active_members.length && (
              <>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Rarely Active Users ({details.rarely_active_members.length}/{details.members.length})
                </Text>
                <Container
                  style={{
                    overflowY: 'scroll',
                    maxHeight: '30vh',
                    padding: '20px'
                  }}
                >
                  <Table
                    //   className={css.instancesTable}
                    data={details.rarely_active_members}
                    columns={[
                      {
                        accessor: 'login',
                        Header: 'Username',
                        width: '25%',
                        Cell: NameCell
                      },
                      {
                        accessor: 'contributions',
                        Header: 'Number of contributions',
                        width: '15%',
                        Cell: TableCell
                      }
                    ]}
                  />
                </Container>
              </>
            )}
            {/* <Table
              //   className={css.instancesTable}
              data={details.members}
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
            /> */}
          </>
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinGitHubDashboardPage

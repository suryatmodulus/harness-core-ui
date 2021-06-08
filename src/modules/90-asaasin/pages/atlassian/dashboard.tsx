import { Table } from '@common/components'
import { Color, Container, Heading, Icon, Layout, Text } from '@wings-software/uicore'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React from 'react'
import type { CellProps } from 'react-table'
import { AtlassianDetailsResponse, GithubMember, useAtlassianDetails } from 'services/asaasin'
function NameCell({ name }: GithubMember): JSX.Element {
  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignContent: 'space-between',
        alignItems: 'center',
        minWidth: '300px',
        boxShadow: '0px 1px 5px -4px black',
        borderRadius: '10px',
        marginBottom: '10px',
        padding: '12px',
        backgroundColor: 'white',
        border: '1px solid transparent'
      }}
    >
      <Icon name="user"></Icon>
      <div style={{ display: 'flex', alignItems: 'center', color: 'black' }}>{name}</div>
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
function RiskCell(tableProps: CellProps<any>): JSX.Element {
  return (
    <>
      {tableProps.value == 1 && (
        <Text lineClamp={3} color={Color.GREEN_300}>
          Low
        </Text>
      )}
      {tableProps.value == 2 && (
        <Text lineClamp={3} color={Color.YELLOW_300}>
          Moderate
        </Text>
      )}
      {tableProps.value == 3 && (
        <Text lineClamp={3} color={Color.RED_300}>
          High
        </Text>
      )}
    </>
  )
}
function getUtilisationChart(details: AtlassianDetailsResponse): Highcharts.Options {
  const defaultOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      plotBackgroundColor: '',
      width: 250,
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
            y: (details.total_users as number) - (details.idle_users?.length as number)
          },
          {
            name: 'Inactive',
            y: details.idle_users?.length
          },
          {
            name: 'Rarely Active',
            y: 0
          },
          {
            name: 'Unused',
            y: 0
          }
        ]
      }
    ]
  }
  return defaultOptions
}
const AsaasinAtlassianDashboard: React.FC = () => {
  const { data: details, loading: loading } = useAtlassianDetails({
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
          <Icon name="service-jira" size={48}></Icon>
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            Jira
          </Text>
        </Layout.Horizontal>

        <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
          View and manage your entire Jira licenses, users, payments, policies and contracts in one place.
        </Text>

        {!loading && details != null && (
          <>
            <Layout.Horizontal
              style={{
                padding: '20px',
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
                    marginLeft: '100px'
                  }}
                >
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        ${details.contract_value?.toLocaleString()}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#9872e7' }}>
                        ${details.potential_savings?.toLocaleString()}
                      </Heading>
                      <Text style={{ color: '#9872e7' }}>Potential Savings</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {details.total_users
                          ? Math.round(((details.idle_users?.length as number) / details.total_users) * 100)
                          : 0}
                        %
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Total Wastage</Text>
                    </Layout.Vertical>
                  </Container>
                </Layout.Horizontal>

                <Layout.Horizontal
                  spacing="xxlarge"
                  style={{
                    padding: '20px',
                    marginLeft: '100px'
                  }}
                >
                  <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#9872e7' }}>
                        {details.total_users}
                      </Heading>
                      <Text style={{ color: '#9872e7' }}>Total Users</Text>
                    </Layout.Vertical>
                  </Container>
                  <Container
                    padding="small"
                    style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}
                  >
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#05AAB6' }}>
                        {(details.total_users as number) - (details.idle_users?.length as number)}
                      </Heading>
                      <Text style={{ color: '#05AAB6' }}>Active Users</Text>
                    </Layout.Vertical>
                  </Container>

                  <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                    <Layout.Vertical spacing="small">
                      <Heading level={1} style={{ color: '#9872e7' }}>
                        {99.98}%
                      </Heading>
                      <Text style={{ color: '#9872e7' }}>Uptime last quarter</Text>
                    </Layout.Vertical>
                  </Container>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
            {details.recommendations?.length && (
              <Container>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Recommendations
                </Text>
                <Table
                  data={details.recommendations}
                  columns={[
                    {
                      accessor: 'message',
                      Header: '',
                      width: '50%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'savings',
                      Header: 'Est. Savings',
                      width: '25%',
                      Cell: DollarCell
                    },
                    {
                      accessor: 'level',
                      Header: 'Risk Score',
                      width: '25%',
                      Cell: RiskCell
                    }
                  ]}
                />
              </Container>
            )}
            {details.idle_users?.length && (
              <>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Inactive Users ({details.idle_users.length}/{details.total_users})
                </Text>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'space-between',
                    justifyContent: 'space-between',
                    minHeight: '25vh',
                    maxHeight: '40vh',
                    maxWidth: '80vw',
                    flexWrap: 'wrap',
                    overflow: 'scroll'
                  }}
                >
                  {details.idle_users.map(user => {
                    return <NameCell name={user}></NameCell>
                  })}
                </div>
              </>
            )}
            {details.rarely_active_users?.length && (
              <>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Rarely Active Users ({details.rarely_active_users.length}/{details.total_users})
                </Text>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'space-between',
                    justifyContent: 'space-between',
                    minHeight: '25vh',
                    maxHeight: '40vh',
                    maxWidth: '80vw',
                    flexWrap: 'wrap',
                    overflow: 'scroll'
                  }}
                >
                  {details.rarely_active_users.map(user => {
                    return <NameCell name={user.email}></NameCell>
                  })}
                </div>
              </>
            )}
            {/* {details.rarely_active_members.length && (
              <>
                <Text font="medium" style={{ lineHeight: '18px', marginTop: '20px' }}>
                  Rarely Active Users ({details.rarely_active_members.length}/{details.members.length})
                </Text>
                <Container
                  style={{
                    overflowY: 'scroll',
                    maxHeight: '30vh',
                    padding: '20px',
                    alignSelf: 'center'
                  }}
                >
                  <Layout.Horizontal spacing="medium">
                    <Table
                      data={details.rarely_active_members.slice(0, getRarelyActiveUsers(details) / 3)}
                      columns={[
                        {
                          accessor: 'login',
                          Header: '',
                          width: '100%',
                          Cell: NameCell
                        }
                      ]}
                    />
                    <Table
                      data={details.rarely_active_members.slice(
                        getRarelyActiveUsers(details) / 3,
                        (2 * getRarelyActiveUsers(details)) / 3
                      )}
                      columns={[
                        {
                          accessor: 'login',
                          Header: '',
                          width: '100%',
                          Cell: NameCell
                        }
                      ]}
                    />
                    <Table
                      data={details.rarely_active_members.slice(
                        (2 * getRarelyActiveUsers(details)) / 3,
                        getRarelyActiveUsers(details)
                      )}
                      columns={[
                        {
                          accessor: 'login',
                          Header: '',
                          width: '100%',
                          Cell: NameCell
                        }
                      ]}
                    />
                  </Layout.Horizontal>
                </Container>
              </>
            )} */}
          </>
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinAtlassianDashboard

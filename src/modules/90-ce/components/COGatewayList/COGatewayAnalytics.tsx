import React, { useEffect, useState } from 'react'
import { Switch, Tab } from '@blueprintjs/core'
import { Layout, Container, Text, Icon, Link, Tabs, Heading } from '@wings-software/uicore'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import {
  AllResourcesOfAccountResponse,
  Service,
  ServiceSavings,
  useAllServiceResources,
  useHealthOfService,
  useSavingsOfService
} from 'services/lw'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/exports'
import useDeleteServiceHook from '@ce/common/useDeleteService'
import COGatewayLogs from './COGatewayLogs'
import COGatewayUsageTime from './COGatewayUsageTime'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import { getInstancesLink, getRelativeTime, getStateTag, getRiskGaugeChartOptions, getDay } from './Utils'
import useToggleRuleState from './useToggleRuleState'
// import SpotvsODChart from './SpotvsODChart'
import css from './COGatewayList.module.scss'
interface COGatewayAnalyticsProps {
  service: { data: Service; index: number } | null | undefined
  handleServiceToggle: (type: 'SUCCESS' | 'FAILURE', data: Service | any, index?: number) => void
  handleServiceDeletion: (type: 'SUCCESS' | 'FAILURE', data: Service | any) => void
  handleServiceEdit: (_service: Service) => void
}

function getBarChartOptions(
  title: string,
  categories: string[],
  yAxisText: string,
  savingsData: number[],
  spendData: number[]
): Highcharts.Options {
  return {
    chart: {
      type: 'column'
    },
    colors: ['rgba(71, 213, 223)', 'rgba(124, 77, 211)'],
    title: {
      text: title
    },
    xAxis: {
      categories: categories
    },
    yAxis: {
      min: 0,
      title: {
        text: yAxisText
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: 'gray'
        }
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false
        }
      }
    },
    series: [
      {
        name: 'Savings',
        type: 'column',
        data: savingsData
      },
      {
        name: 'Spend',
        type: 'column',
        data: spendData
      }
    ]
  }
}
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'
const today = () => moment()
const startOfDay = (time: moment.Moment) => time.startOf('day').toDate()
const endOfDay = (time: moment.Moment) => time.endOf('day').toDate()

const COGatewayAnalytics: React.FC<COGatewayAnalyticsProps> = props => {
  const { orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [categories, setCategories] = useState<string[]>([])
  const [savingsSeries, setSavingsSeries] = useState<number[]>([])
  const [spendSeries, setSpendSeries] = useState<number[]>([])
  const { data, loading } = useSavingsOfService({
    org_id: orgIdentifier, // eslint-disable-line
    projectID: projectIdentifier, // eslint-disable-line
    serviceID: props.service?.data.id as number
  })
  const { data: graphData, loading: graphLoading } = useSavingsOfService({
    org_id: orgIdentifier, // eslint-disable-line
    projectID: projectIdentifier, // eslint-disable-line
    serviceID: props.service?.data.id as number,
    queryParams: {
      from: moment(startOfDay(today().subtract(7, 'days'))).format(DATE_FORMAT),
      to: moment(endOfDay(today())).format(DATE_FORMAT),
      group_by: 'date' // eslint-disable-line
    }
  })
  const { data: healthData, loading: healthDataLoading } = useHealthOfService({
    org_id: orgIdentifier, // eslint-disable-line
    projectID: projectIdentifier, // eslint-disable-line
    serviceID: props.service?.data.id as number,
    debounce: 300
  })
  const { data: resources, loading: resourcesLoading, error: resourceError } = useAllServiceResources({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    service_id: props.service?.data.id as number, // eslint-disable-line
    debounce: 300
  })

  const { triggerToggle } = useToggleRuleState({
    orgIdentifier,
    projectIdentifier,
    serviceData: props.service?.data as Service,
    onSuccess: (updatedServiceData: Service) =>
      props.handleServiceToggle('SUCCESS', updatedServiceData, props.service?.index),
    onFailure: error => props.handleServiceToggle('FAILURE', error)
  })
  const { triggerDelete } = useDeleteServiceHook({
    orgIdentifier,
    projectIdentifier,
    serviceData: props.service?.data as Service,
    onSuccess: (_data: Service) => props.handleServiceDeletion('SUCCESS', _data),
    onFailure: err => props.handleServiceDeletion('FAILURE', err)
  })

  if (resourceError) {
    showError(`could not load resources for rule`)
  }
  useEffect(() => {
    if (graphLoading) {
      return
    }
    const newCategroies: string[] = []
    const newSavings: number[] = []
    const newSpends: number[] = []
    const savingsEntries: ServiceSavings[] = graphData?.response ? (graphData.response as ServiceSavings[]) : []
    savingsEntries.forEach(element => {
      newCategroies.push(getDay(element.usage_date as string, DATE_FORMAT))
      newSavings.push(Math.round((element.actual_savings as number) * 100) / 100)
      newSpends.push(
        Math.round((element.potential_cost as number) * 100 - (element.actual_savings as number) * 100) / 100
      )
    })
    setCategories(newCategroies)
    setSavingsSeries(newSavings)
    setSpendSeries(newSpends)
  }, [graphData])
  return (
    <Container>
      <Layout.Vertical spacing="large" padding="xlarge">
        <Layout.Horizontal className={css.analyticsHeader}>
          <Layout.Horizontal width="50%">
            <Heading level={2} font={{ weight: 'semi-bold' }}>
              {props.service?.data.name}
            </Heading>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="large" width="50%" className={css.headerLayout}>
            <Layout.Horizontal flex spacing="large">
              <Switch checked={!props.service?.data.disabled} onChange={() => triggerToggle()}></Switch>
              <Icon
                name="edit"
                style={{ marginBottom: '10px', cursor: 'pointer' }}
                onClick={() => props.handleServiceEdit(props.service?.data as Service)}
              ></Icon>
              <Icon
                name="trash"
                style={{ marginBottom: '10px', cursor: 'pointer' }}
                onClick={() => triggerDelete()}
              ></Icon>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Text>
          {`Created ${getRelativeTime(props.service?.data.created_at as string, 'YYYY-MM-DDTHH:mm:ssZ')}`}
          {/* <Avatar email="john.doe@harnes.io" size={'small'} />
          {'John Doe '} */}
        </Text>
        <Heading level={3}>DETAILS</Heading>
        <Layout.Horizontal spacing="large" padding="medium">
          <Layout.Vertical spacing="large" padding="medium">
            <Text>Connector</Text>
            <Layout.Horizontal spacing="xsmall">
              <Icon name="service-aws" />
              <Text>{props.service?.data.metadata?.cloud_provider_details?.name}</Text>
            </Layout.Horizontal>
            <Text>Idle time</Text>
            <Layout.Horizontal spacing="xsmall">
              <Icon name="deployment-timeout-legacy" />
              <Text>{props.service?.data.idle_time_mins}</Text>
            </Layout.Horizontal>
            <Text>Compute type</Text>
            <Layout.Horizontal spacing="xsmall">
              <img src={props.service?.data.fulfilment == 'spot' ? spotIcon : odIcon} alt="" aria-hidden />
              <Text>{props.service?.data.fulfilment}</Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Vertical spacing="large" padding="medium">
            <Text>Instances managed by the Rule</Text>
            <Layout.Horizontal spacing="xsmall">
              {!resourcesLoading && resources ? (
                <Link
                  href={getInstancesLink(resources as AllResourcesOfAccountResponse)}
                  target="_blank"
                  style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {resources?.response?.length} Instances
                </Link>
              ) : (
                <Icon name="spinner" size={12} color="blue500" />
              )}
              {healthData?.response?.['state'] != null ? (
                getStateTag(healthData?.response?.['state'])
              ) : !healthDataLoading ? (
                getStateTag('down')
              ) : (
                <Icon name="spinner" size={12} color="blue500" />
              )}
            </Layout.Horizontal>
            <Text>Host name</Text>
            <Layout.Horizontal spacing="xsmall">
              <Link href={`http://${props.service?.data.host_name}`} target="_blank">
                {props.service?.data.host_name}
              </Link>
            </Layout.Horizontal>
            {props.service?.data.custom_domains?.length ? (
              <>
                <Text>Custom Domain</Text>
                {props.service?.data.custom_domains.map((d, i) => {
                  return (
                    <Layout.Horizontal spacing="xsmall" key={`custom_domain${i}`}>
                      <Link key={`custom_domain${i}`} href={`http://${d}`} target="_blank">
                        {d}
                      </Link>
                    </Layout.Horizontal>
                  )
                })}
              </>
            ) : null}
          </Layout.Vertical>
        </Layout.Horizontal>
        <Container padding="medium" style={{ backgroundColor: '#f7fbfe' }}>
          <Layout.Horizontal spacing="large">
            {loading ? (
              <Icon name="spinner" size={12} color="blue500" />
            ) : (
              <>
                {/* <Layout.Horizontal spacing="medium">
                  {props.service.fulfilment == 'spot' ? <SpotvsODChart spotPercent={76}></SpotvsODChart> : null} */}
                <Layout.Horizontal spacing="medium">
                  <div style={{ alignSelf: 'center' }}>
                    <HighchartsReact
                      highchart={Highcharts}
                      options={
                        data?.response != null
                          ? getRiskGaugeChartOptions((data?.response as ServiceSavings).savings_percentage as number)
                          : getRiskGaugeChartOptions(0)
                      }
                    />
                  </div>
                  <Layout.Vertical spacing="xsmall" padding="large">
                    <Heading level={2}>
                      $
                      {data?.response != null
                        ? Math.round(((data?.response as ServiceSavings).actual_savings as number) * 100) / 100
                        : 0}
                    </Heading>
                    <Text>Cumulative Savings</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                {/* </Layout.Horizontal> */}
              </>
            )}
          </Layout.Horizontal>
        </Container>
        <Layout.Horizontal spacing="small" style={{ alignSelf: 'center' }}>
          <Text>Showing data for Last 7 days</Text>
        </Layout.Horizontal>
        <Heading level={3}>SPEND VS SAVINGS</Heading>
        {graphLoading ? (
          <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
        ) : categories.length ? (
          <HighchartsReact
            highchart={Highcharts}
            options={getBarChartOptions('', categories, '', savingsSeries, spendSeries)}
          />
        ) : (
          <Text style={{ alignSelf: 'center', fontSize: 'var(--font-size-medium)' }}>{getString('ce.co.noData')}</Text>
        )}
        <Heading level={3}>LOGS AND USAGE TIME</Heading>
        <Tabs id="logsAndUsage">
          <Tab id="name" title={'Usage Time'} panel={<COGatewayUsageTime service={props.service?.data} />}></Tab>
          <Tab id="logs" title={'Logs'} panel={<COGatewayLogs service={props.service?.data} />}></Tab>
        </Tabs>
      </Layout.Vertical>
    </Container>
  )
}

export default COGatewayAnalytics

import React, { useState, useEffect } from 'react'
import type { CellProps } from 'react-table'
import { Drawer } from '@blueprintjs/core'
import {
  Formik,
  FormikForm,
  FormInput,
  Container,
  Layout,
  CardSelect,
  Label,
  Text,
  Table,
  Color,
  Tabs,
  Tab,
  Collapse,
  Button,
  Switch,
  Icon
} from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useToaster } from '@common/exports'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import COInstanceSelector from '@ce/components/COInstanceSelector/COInstanceSelector'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import {
  HealthCheck,
  PortConfig,
  Service,
  ServiceDep,
  useAllResourcesOfAccount,
  useGetServices,
  useSecurityGroupsOfInstances
} from 'services/lw'
import CORoutingTable from './CORoutingTable'
import COHealthCheckTable from './COHealthCheckTable'
import i18n from './COGatewayConfig.i18n'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import CORuleDendencySelector from './CORuleDependencySelector'
import css from './COGatewayConfig.module.scss'

interface COGatewayConfigProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  valid: boolean
  setValidity: (tab: boolean) => void
}
interface CardData {
  text: string
  value: string
  icon: string
}

const instanceTypeCardData: CardData[] = [
  {
    text: 'Spot',
    value: 'spot',
    icon: spotIcon
  },
  {
    text: 'On-demand',
    value: 'ondemand',
    icon: odIcon
  }
]
const portProtocolMap: { [key: number]: string } = {
  80: 'http',
  443: 'https'
}
const COGatewayConfig: React.FC<COGatewayConfigProps> = props => {
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(props.gatewayDetails.selectedInstances)
  const [filteredInstances, setFilteredInstances] = useState<InstanceDetails[]>([])
  const [allInstances, setAllInstances] = useState<InstanceDetails[]>([])
  const [healthCheck, setHealthCheck] = useState<boolean>(props.gatewayDetails.healthCheck ? true : false)
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck>(props.gatewayDetails.healthCheck)
  const [gatewayName, setGatewayName] = useState<string>(props.gatewayDetails.name)
  const [idleTime, setIdleTime] = useState<number>(props.gatewayDetails.idleTimeMins)
  const [fullfilment, setFullfilment] = useState<string>(props.gatewayDetails.fullfilment)
  const [matchSubdomains, setMatchSubdomains] = useState<boolean>(
    props.gatewayDetails.matchAllSubdomains ? props.gatewayDetails.matchAllSubdomains : false
  )
  const [usePrivateIP, setUsePrivateIP] = useState<boolean>(
    props.gatewayDetails.opts.alwaysUsePrivateIP ? props.gatewayDetails.opts.alwaysUsePrivateIP : false
  )
  const [routingRecords, setRoutingRecords] = useState<PortConfig[]>(props.gatewayDetails.routing.ports)
  const [serviceDependencies, setServiceDependencies] = useState<ServiceDep[]>(props.gatewayDetails.deps || [])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!props.gatewayDetails.fullfilment)

  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { showError } = useToaster()
  function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value}
      </Text>
    )
  }
  function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value} {tableProps.row.original.id}
      </Text>
    )
  }

  const { mutate: getInstances, loading: loadingInstances } = useAllResourcesOfAccount({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      type: 'instance'
    }
  })
  const { data, error } = useGetServices({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    debounce: 300
  })
  if (error) {
    showError('Faield to fetch services')
  }
  useEffect(() => {
    props.gatewayDetails.routing.ports = routingRecords
    props.setGatewayDetails(props.gatewayDetails)
  }, [routingRecords])
  useEffect(() => {
    props.gatewayDetails.deps = serviceDependencies
    props.setGatewayDetails(props.gatewayDetails)
  }, [serviceDependencies])
  useEffect(() => {
    if (healthCheck) {
      props.gatewayDetails.healthCheck = healthCheckPattern
      props.setGatewayDetails(props.gatewayDetails)
    } else {
      props.gatewayDetails.healthCheck = {}
      props.setGatewayDetails(props.gatewayDetails)
    }
  }, [healthCheckPattern])
  const refreshInstances = async (): Promise<void> => {
    try {
      const result = await getInstances(
        { Text: '' },
        {
          queryParams: {
            cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
            type: 'instance'
          }
        }
      )
      if (result && result.response) {
        const instances = result.response
          ?.filter(x => x.status != 'terminated')
          .map(item => {
            return {
              name: item.name ? item.name : '',
              id: item.id ? item.id : '',
              ipv4: item.ipv4 ? item.ipv4[0] : '',
              region: item.region ? item.region : '',
              type: item.type ? item.type : '',
              tags: '',
              launch_time: item.launch_time ? item.launch_time : '', // eslint-disable-line
              status: item.status ? item.status : '',
              vpc: item.metadata ? item.metadata['VpcID'] : ''
            }
          })
        setAllInstances(instances)
        setFilteredInstances(instances)
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }
  const { mutate: getSecurityGroups, loading } = useSecurityGroupsOfInstances({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id // eslint-disable-line
    }
  })
  const fetchInstanceSecurityGroups = async (): Promise<void> => {
    const emptyRecords: PortConfig[] = []
    try {
      const result = await getSecurityGroups({
        text: `id = ['${
          props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].id : ''
        }']\nregions = ['${
          props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].region : ''
        }']`
      })
      if (result && result.response) {
        Object.keys(result.response).forEach(instance => {
          result.response?.[instance].forEach(sg => {
            sg?.inbound_rules?.forEach(rule => {
              if (rule.protocol == '-1') {
                addAllPorts()
                return
              } else if (rule && rule.from && [80, 443].includes(+rule.from)) {
                const fromRule = +rule.from
                const toRule = +(rule.to ? rule.to : 0)
                emptyRecords.push({
                  protocol: portProtocolMap[fromRule],
                  port: fromRule,
                  action: 'forward',
                  target_protocol: portProtocolMap[fromRule], // eslint-disable-line
                  target_port: toRule, // eslint-disable-line
                  server_name: '', // eslint-disable-line
                  redirect_url: '', // eslint-disable-line
                  routing_rules: [] // eslint-disable-line
                })
                const routes = [...emptyRecords]
                if (routes.length) setRoutingRecords(routes)
              }
            })
          })
        })
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  function isValid(): boolean {
    return (
      selectedInstances.length > 0 &&
      routingRecords.length > 0 &&
      gatewayName != '' &&
      idleTime >= 5 &&
      fullfilment != ''
    )
  }
  useEffect(() => {
    if (!selectedInstances.length) {
      setRoutingRecords([])
      return
    }
    if (routingRecords.length) {
      return
    }
    fetchInstanceSecurityGroups()
  }, [selectedInstances])
  useEffect(() => {
    if (!props.gatewayDetails.provider) return
    refreshInstances()
  }, [props.gatewayDetails.provider])
  useEffect(() => {
    if (isValid()) {
      props.setValidity(true)
    } else {
      props.setValidity(false)
    }
  }, [selectedInstances, routingRecords, gatewayName, idleTime, fullfilment])
  function handleSearch(text: string): void {
    if (!text) {
      setFilteredInstances(allInstances)
      return
    }
    const instances: InstanceDetails[] = []
    allInstances.forEach(t => {
      const r = t as InstanceDetails
      const name = r.name as string
      const id = r.id as string
      if (name.indexOf(text) >= 0 || id.indexOf(text) >= 0) {
        instances.push(t)
      }
    })
    setFilteredInstances(instances)
  }
  function addPort(): void {
    routingRecords.push({
      protocol: 'http',
      port: 80,
      action: 'forward',
      target_protocol: 'http', // eslint-disable-line
      target_port: 80, // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      server_name: '', // eslint-disable-line
      routing_rules: [] // eslint-disable-line
    })
    const routes = [...routingRecords]
    setRoutingRecords(routes)
  }
  function addAllPorts(): void {
    const emptyRecords: PortConfig[] = []
    Object.keys(portProtocolMap).forEach(item => {
      emptyRecords.push({
        protocol: portProtocolMap[+item],
        port: +item,
        action: 'forward',
        target_protocol: portProtocolMap[+item], // eslint-disable-line
        target_port: +item, // eslint-disable-line
        server_name: '', // eslint-disable-line
        redirect_url: '', // eslint-disable-line
        routing_rules: [] // eslint-disable-line
      })
    })
    const routes = [...emptyRecords]
    if (routes.length) setRoutingRecords(routes)
  }
  function addDependency(): void {
    serviceDependencies.push({
      delay_secs: 5 // eslint-disable-line
    })
    const deps = [...serviceDependencies]
    setServiceDependencies(deps)
  }
  return (
    <Layout.Vertical className={css.page}>
      <Drawer
        autoFocus={true}
        enforceFocus={true}
        hasBackdrop={false}
        usePortal={true}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
        size="392px"
        style={{
          top: '86px',
          boxShadow: '0px 2px 8px rgba(40, 41, 61, 0.04), 0px 16px 24px rgba(96, 97, 112, 0.16)',
          height: 'calc(100vh - 86px)',
          overflowY: 'scroll'
        }}
      >
        <Container style={{ textAlign: 'right' }}>
          <Button icon="cross" minimal onClick={_ => setDrawerOpen(false)} />
        </Container>
        <COHelpSidebar pageName="configuration" activeSectionNames={[]} />
      </Drawer>
      <Container style={{ paddingTop: 10 }}>
        <Layout.Vertical spacing="large" padding="large">
          <Text style={{ fontSize: '18px', lineHeight: '20px', fontWeight: 500 }}>{i18n.configHeading}</Text>
          <Container width="50%">
            <Formik
              initialValues={{
                gatewayName: props.gatewayDetails.name,
                idleTime: props.gatewayDetails.idleTimeMins,
                selectedIcon: props.gatewayDetails.fullfilment
              }}
              onSubmit={values => alert(JSON.stringify(values))}
              render={formik => (
                <FormikForm className={css.gatewayConfigForm}>
                  <Layout.Vertical spacing="xxxlarge" width="50%">
                    <FormInput.Text
                      name="gatewayName"
                      label={i18n.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formik.setFieldValue('gatewayName', e.target.value)
                        props.gatewayDetails.name = e.target.value
                        props.setGatewayDetails(props.gatewayDetails)
                        setGatewayName(e.target.value)
                      }}
                      style={{ height: '30px', fontSize: 'var(--font-size-normal)' }}
                    />
                    <FormInput.Text
                      name="idleTime"
                      label={
                        <Layout.Horizontal spacing="small">
                          <Text>Idle time (mins)</Text>
                          <Icon
                            name="info"
                            onClick={() => {
                              setDrawerOpen(true)
                            }}
                          ></Icon>
                        </Layout.Horizontal>
                      }
                      placeholder="Enter time"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formik.setFieldValue('idleTime', e.target.value)
                        props.gatewayDetails.idleTimeMins = +e.target.value
                        props.setGatewayDetails(props.gatewayDetails)
                        setIdleTime(+e.target.value)
                      }}
                    />
                    <Layout.Horizontal spacing="small">
                      <Label style={{ fontSize: 'var(--font-size-normal)', lineHeight: '20px' }}>
                        Select Instance type
                      </Label>
                      <Icon
                        name="info"
                        onClick={() => {
                          setDrawerOpen(true)
                        }}
                      ></Icon>
                    </Layout.Horizontal>

                    <CardSelect
                      data={instanceTypeCardData}
                      className={css.instanceTypeViewGrid}
                      onChange={item => {
                        props.gatewayDetails.fullfilment = item.value
                        props.setGatewayDetails(props.gatewayDetails)
                        formik.setFieldValue('selectedIcon', item.value)
                        setFullfilment(item.value)
                      }}
                      renderItem={(item, _) => (
                        <Layout.Vertical spacing="large">
                          <img src={item.icon} alt="" aria-hidden />
                        </Layout.Vertical>
                      )}
                      selected={
                        instanceTypeCardData[
                          instanceTypeCardData.findIndex(card => card.value == formik.values.selectedIcon)
                        ]
                      }
                      cornerSelected={true}
                    ></CardSelect>
                    <Layout.Horizontal spacing="medium" className={css.instanceTypeNameGrid}>
                      <Text font={{ align: 'center' }} style={{ fontSize: 12 }}>
                        Spot
                      </Text>
                      <Text font={{ align: 'center' }} style={{ fontSize: 12 }}>
                        On demand
                      </Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </FormikForm>
              )}
              validationSchema={Yup.object().shape({
                gatewayName: Yup.string().trim().required('Rule Name is required field'),
                idleTime: Yup.number().required('Idle Time is required field'),
                selectedIcon: Yup.string().required('Instance Type is required field')
              })}
            ></Formik>
          </Container>

          {fullfilment ? (
            <>
              <Label style={{ fontSize: 'var(--font-size-normal)', lineHeight: '20px' }}>Instances</Label>
              <Container style={{ background: 'var(--grey-100)', padding: 25, maxWidth: '940px' }}>
                <Text
                  style={{
                    color: 'var(--grey-500)',
                    lineHeight: '24px',
                    fontSize: 'var(--font-size-normal)',
                    maxWidth: '890px'
                  }}
                >
                  {i18n.info}
                </Text>
                {selectedInstances.length ? (
                  <Table<InstanceDetails>
                    data={selectedInstances}
                    bpTableProps={{}}
                    className={css.instanceTable}
                    columns={[
                      {
                        accessor: 'name',
                        Header: 'NAME AND ID',
                        width: '16.5%',
                        Cell: NameCell
                      },
                      {
                        accessor: 'ipv4',
                        Header: 'IP ADDRESS',
                        width: '16.5%',
                        Cell: TableCell,
                        disableSortBy: true
                      },
                      {
                        accessor: 'region',
                        Header: 'REGION',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'type',
                        Header: 'TYPE',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'tags',
                        Header: 'TAGS',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'launch_time',
                        Header: 'LAUNCH TIME',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'status',
                        Header: 'STATUS',
                        width: '16.5%',
                        Cell: TableCell
                      }
                    ]}
                  />
                ) : null}
              </Container>
              <Container style={{ background: 'var(--grey-100)', padding: 25, maxWidth: '947px' }}>
                <Collapse collapsedIcon="plus" heading={i18n.addInstanceLabel}>
                  <Button style={{ float: 'right' }} onClick={refreshInstances} icon="refresh" />
                  {loadingInstances ? (
                    <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center', marginTop: '10px' }} />
                  ) : (
                    <COInstanceSelector
                      selectedInstances={selectedInstances}
                      setSelectedInstances={setSelectedInstances}
                      setGatewayDetails={props.setGatewayDetails}
                      instances={filteredInstances}
                      gatewayDetails={props.gatewayDetails}
                      search={handleSearch}
                    />
                  )}
                </Collapse>
              </Container>
              {selectedInstances.length ? (
                <Container style={{ justifyContent: 'center', maxWidth: '947px' }}>
                  <Container className={css.configTab}>
                    <Tabs id="tabsId1">
                      <Tab
                        id="routing"
                        title="Routing"
                        panel={
                          <Container style={{ backgroundColor: '#FBFBFB' }}>
                            <Layout.Vertical spacing="large">
                              {loading ? (
                                <Icon
                                  name="spinner"
                                  size={24}
                                  color="blue500"
                                  style={{ alignSelf: 'center', marginTop: '10px' }}
                                />
                              ) : (
                                <CORoutingTable routingRecords={routingRecords} setRoutingRecords={setRoutingRecords} />
                              )}
                              <Container className={css.rowItem}>
                                <Text
                                  onClick={() => {
                                    addPort()
                                  }}
                                >
                                  {i18n.addPortLabel}
                                </Text>
                              </Container>
                            </Layout.Vertical>
                          </Container>
                        }
                      />
                      <Tab
                        id="healthcheck"
                        title="Health check"
                        panel={
                          <Container style={{ backgroundColor: '#FBFBFB', maxWidth: '523px', marginLeft: '210px' }}>
                            <Layout.Vertical spacing="large" padding="large">
                              <Switch
                                label={i18n.healthCheck}
                                className={css.switchFont}
                                onChange={e => {
                                  setHealthCheck(e.currentTarget.checked)
                                }}
                                checked={healthCheck}
                              />
                              {healthCheck ? (
                                <COHealthCheckTable
                                  pattern={healthCheckPattern}
                                  updatePattern={setHealthCheckPattern}
                                />
                              ) : null}
                            </Layout.Vertical>
                          </Container>
                        }
                      />
                      <Tab
                        id="advanced"
                        title="Advanced Configuration"
                        panel={
                          <Container style={{ backgroundColor: '#FBFBFB', width: '595px', marginLeft: '175px' }}>
                            <Layout.Vertical spacing="medium" style={{ padding: '32px' }}>
                              <Switch
                                label={i18n.allowTraffic}
                                width="50%"
                                className={css.switchFont}
                                checked={matchSubdomains}
                                onChange={e => {
                                  props.gatewayDetails.matchAllSubdomains = e.currentTarget.checked
                                  setMatchSubdomains(e.currentTarget.checked)
                                  props.setGatewayDetails(props.gatewayDetails)
                                }}
                              />
                              <Switch
                                label={i18n.usePrivateIP}
                                width="50%"
                                className={css.switchFont}
                                checked={usePrivateIP}
                                onChange={e => {
                                  props.gatewayDetails.opts.alwaysUsePrivateIP = e.currentTarget.checked
                                  setUsePrivateIP(e.currentTarget.checked)
                                  props.setGatewayDetails(props.gatewayDetails)
                                }}
                              />
                              {serviceDependencies && serviceDependencies.length ? (
                                <CORuleDendencySelector
                                  deps={serviceDependencies}
                                  setDeps={setServiceDependencies}
                                  service_id={props.gatewayDetails.id}
                                  allServices={data?.response as Service[]}
                                ></CORuleDendencySelector>
                              ) : null}
                              <Container>
                                <Text
                                  onClick={() => {
                                    addDependency()
                                  }}
                                  style={{ color: 'var(--blue-500)', cursor: 'pointer' }}
                                >
                                  {'+ add dependency'}
                                </Text>
                              </Container>
                            </Layout.Vertical>
                          </Container>
                        }
                      />
                    </Tabs>
                  </Container>
                </Container>
              ) : null}
            </>
          ) : null}
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export default COGatewayConfig

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import type { CellProps } from 'react-table'
import { debounce as _debounce, isEmpty as _isEmpty, get as _get } from 'lodash-es'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import {
  Formik,
  FormikForm,
  FormInput,
  Container,
  Layout,
  CardSelect,
  Text,
  Table,
  Color,
  Tabs,
  Tab,
  Button,
  Switch,
  Icon,
  Card,
  useModalHook,
  IconName
} from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikContext } from 'formik'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useToaster } from '@common/exports'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import COInstanceSelector from '@ce/components/COInstanceSelector/COInstanceSelector'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import { Utils } from '@ce/common/Utils'
import {
  ASGMinimal,
  HealthCheck,
  PortConfig,
  Service,
  ServiceDep,
  useAllResourcesOfAccount,
  useGetAllASGs,
  useGetServices,
  useSecurityGroupsOfInstances
} from 'services/lw'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CORoutingTable from './CORoutingTable'
import COHealthCheckTable from './COHealthCheckTable'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import CORuleDendencySelector from './CORuleDependencySelector'
import COGatewayConfigStep from './COGatewayConfigStep'
import COFixedDrawer from '../COGatewayAccess/COFixedDrawer'
import COAsgSelector from '../COAsgSelector'
import css from './COGatewayConfig.module.scss'

interface COGatewayConfigProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  valid: boolean
  setValidity: (tab: boolean) => void
  activeStepDetails?: { count?: number; tabId?: string } | null
}
interface CardData {
  text: string
  value: string
  icon: string
  providers?: string[]
}

const instanceTypeCardData: CardData[] = [
  {
    text: 'Spot',
    value: 'spot',
    icon: spotIcon,
    providers: ['aws']
  },
  {
    text: 'On demand',
    value: 'ondemand',
    icon: odIcon,
    providers: ['aws', 'azure']
  }
]
const portProtocolMap: { [key: number]: string } = {
  80: 'http',
  443: 'https'
}

enum RESOURCES {
  INSTANCES = 'INSTANCES',
  ASG = 'ASG'
}

const managedResources = [
  { label: 'Instances', value: RESOURCES.INSTANCES, providers: ['aws', 'azure'] },
  { label: 'Auto-scaling groups', value: RESOURCES.ASG, providers: ['aws'] }
]

const modalProps: IDialogProps = {
  isOpen: true,
  style: {
    width: 1000,
    minHeight: 350,
    borderTop: '5px solid #0091FF',
    padding: 40,
    position: 'relative',
    overflow: 'hidden'
  }
}

const CONFIG_STEP_IDS = ['configStep1', 'configStep2', 'configStep3', 'configStep4']

const COGatewayConfig: React.FC<COGatewayConfigProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
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
  const [, setDrawerOpen] = useState<boolean>(!props.gatewayDetails.fullfilment)
  const [selectedResource, setSelectedResource] = useState<RESOURCES | null>(
    !_isEmpty(props.gatewayDetails.selectedInstances)
      ? RESOURCES.INSTANCES
      : !_isEmpty(props.gatewayDetails.routing?.instance?.scale_group)
      ? RESOURCES.ASG
      : null
  )
  const [selectedInstanceType, setSelectedInstanceType] = useState<CardData | null>(
    props.gatewayDetails.fullfilment
      ? instanceTypeCardData[instanceTypeCardData.findIndex(card => card.value == props.gatewayDetails.fullfilment)]
      : null
  )
  const configContEl = useRef<HTMLDivElement>(null)
  const [activeDrawerIds, setActiveDrawerIds] = useState<string[]>([CONFIG_STEP_IDS[0], CONFIG_STEP_IDS[1]])
  const [activeConfigTabId, setActiveConfigTabId] = useState<string | undefined>(props.activeStepDetails?.tabId)
  const [asgToShow, setAsgToShow] = useState<ASGMinimal[]>([])
  const [allAsg, setAllAsg] = useState<ASGMinimal[]>([])
  const [selectedAsg, setSelectedAsg] = useState<ASGMinimal | undefined>(
    props.gatewayDetails.routing?.instance?.scale_group
  )

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
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

  const RemoveCell = (tableProps: CellProps<InstanceDetails>) => {
    const handleDeletion = () => {
      const instances = [...selectedInstances]
      instances.splice(tableProps.row.index, 1)
      if (instances.length) {
        const updatedGatewayDetails = { ...props.gatewayDetails }
        updatedGatewayDetails.selectedInstances = instances
        props.setGatewayDetails(updatedGatewayDetails)
        setSelectedInstances(instances)
      } else {
        resetSelectedInstancesDetails()
      }
    }
    return <Button className={css.clearBtn} icon={'delete'} onClick={handleDeletion} />
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

  const { mutate: fetchAllASGs, loading: loadingFetchASGs } = useGetAllASGs({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id // eslint-disable-line
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

  const [openInstancesModal, closeInstancesModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <COInstanceSelector
          selectedInstances={selectedInstances}
          setSelectedInstances={setSelectedInstances}
          setGatewayDetails={props.setGatewayDetails}
          instances={filteredInstances}
          gatewayDetails={props.gatewayDetails}
          search={handleSearch}
          onInstancesAddSuccess={() => {
            handleSearch('')
            closeInstancesModal()
          }}
          loading={loadingInstances}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            handleSearch('')
            closeInstancesModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, [filteredInstances, selectedInstances, loadingInstances])

  const handleAsgSearch = (text: string) => {
    if (!text) {
      setAsgToShow([])
      return
    }
    text = text.toLowerCase()
    const filteredScalingGroups = allAsg.filter(
      item => item.name?.toLowerCase().includes(text) || item.id?.toLowerCase().includes(text)
    )
    setAsgToShow(filteredScalingGroups)
  }

  const [openAsgModal, closeAsgModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <COAsgSelector
          selectedScalingGroup={selectedAsg}
          setSelectedAsg={setSelectedAsg}
          setGatewayDetails={props.setGatewayDetails}
          scalingGroups={!_isEmpty(asgToShow) ? asgToShow : allAsg}
          gatewayDetails={props.gatewayDetails}
          search={handleAsgSearch}
          onAsgAddSuccess={updatedGatewayDetails => {
            setRoutingRecords(updatedGatewayDetails.routing.ports)
            handleAsgSearch('')
            closeAsgModal()
          }}
          loading={loadingFetchASGs}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            handleAsgSearch('')
            closeAsgModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-asg-modal'}
        />
      </Dialog>
    )
  }, [allAsg, asgToShow, selectedAsg, loadingFetchASGs])

  useLayoutEffect(() => {
    const observeScrollHandler = _debounce(() => {
      const parentElVal = (configContEl.current as HTMLDivElement).getBoundingClientRect()
      const configStepsContainers: HTMLElement[] = []
      CONFIG_STEP_IDS.forEach((_id: string) => {
        const element = document.getElementById(_id)
        element && configStepsContainers.push(element)
      })
      const newActiveIds: string[] = []
      configStepsContainers.forEach((stepEl, _i) => {
        const { top, bottom, height } = stepEl.getBoundingClientRect()
        if (
          (top > parentElVal.top || bottom - parentElVal.top > 100) &&
          (bottom <= parentElVal.bottom || (height >= parentElVal.height ? bottom > parentElVal.bottom : false))
        ) {
          newActiveIds.push(stepEl.id)
        }
      })
      setActiveDrawerIds(newActiveIds)
    }, 500)

    {
      ;(configContEl.current as HTMLDivElement).addEventListener('scroll', observeScrollHandler)
      if (props.activeStepDetails?.count) {
        const el = document.getElementById(`configStep${props.activeStepDetails.count}`)
        el?.scrollIntoView()
      }
    }

    return () => {
      ;(configContEl.current as HTMLDivElement).removeEventListener('scroll', observeScrollHandler)
    }
  }, [])

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
              vpc: item.metadata ? item.metadata['VpcID'] : '',
              ...(isAzureProvider && { metadata: { resourceGroup: item.metadata?.resourceGroup } })
            }
          })
        setAllInstances(instances)
        setFilteredInstances(instances)
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const fetchAndSetAsgItems = async (): Promise<void> => {
    try {
      const result = await fetchAllASGs({ Text: '' })
      if (result?.response) {
        const filteredAsgs = result.response.filter((item: ASGMinimal) => !_isEmpty(item.target_groups))
        setAllAsg(filteredAsgs)
      }
    } catch (err) {
      showError(err.data?.message || err.message)
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
      (selectedInstances.length > 0 || !_isEmpty(selectedAsg)) &&
      routingRecords.length > 0 &&
      gatewayName != '' &&
      idleTime >= 5 &&
      (selectedResource === RESOURCES.INSTANCES ? fullfilment != '' : true) &&
      (!_isEmpty(serviceDependencies)
        ? serviceDependencies.every(_dep => !isNaN(_dep.dep_id) && !isNaN(_dep.delay_secs))
        : true)
    )
  }

  const resetSelectedInstancesDetails = () => {
    setRoutingRecords([])
    setSelectedInstances([])
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.selectedInstances = []
    props.setGatewayDetails(updatedGatewayDetails)
  }

  const clearResourceDetailsFromGateway = (resourceType: RESOURCES) => {
    if (resourceType) {
      const updatedGatewayDetails = { ...props.gatewayDetails }
      switch (resourceType) {
        case RESOURCES.INSTANCES:
          // remove details related to AsG
          if (!_isEmpty(updatedGatewayDetails.routing.instance.scale_group)) {
            setRoutingRecords([])
            setSelectedAsg(undefined)
            delete updatedGatewayDetails.routing.instance.scale_group
            props.setGatewayDetails(updatedGatewayDetails)
          }
          break
        case RESOURCES.ASG:
          // remove details related to instances
          if (!_isEmpty(updatedGatewayDetails.selectedInstances)) {
            resetSelectedInstancesDetails()
          }
          break
        default:
          return
      }
    }
  }

  useEffect(() => {
    // run only in case of selecting instances
    if (selectedResource === RESOURCES.INSTANCES) {
      if (!selectedInstances.length) {
        setRoutingRecords([])
        return
      }
      if (routingRecords.length) {
        return
      }
      isAwsProvider && fetchInstanceSecurityGroups()
    }
  }, [selectedInstances])

  useEffect(() => {
    clearResourceDetailsFromGateway(selectedResource as RESOURCES)
  }, [selectedResource])

  useEffect(() => {
    if (!props.gatewayDetails.provider) return
    refreshInstances()
    isAwsProvider && fetchAndSetAsgItems()
  }, [props.gatewayDetails.provider])
  useEffect(() => {
    if (isValid()) {
      props.setValidity(true)
    } else {
      props.setValidity(false)
    }
  }, [selectedInstances, routingRecords, gatewayName, idleTime, fullfilment, selectedAsg, serviceDependencies])
  function handleSearch(text: string): void {
    if (!text) {
      setFilteredInstances(allInstances)
      return
    }
    text = text.toLowerCase()
    const instances: InstanceDetails[] = []
    allInstances.forEach(t => {
      const r = t as InstanceDetails
      const name = r.name as string
      const id = r.id as string
      if (name.toLowerCase().indexOf(text) >= 0 || id.toLowerCase().indexOf(text) >= 0) {
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

  const handleAsgInstancesChange = (formik: FormikContext<any>, val: string, instanceType: 'OD' | 'SPOT') => {
    switch (instanceType) {
      case 'OD':
        if (Utils.isNumber(val)) {
          const numericVal = Number(val)
          formik.setFieldValue('odInstance', numericVal)
          selectedAsg?.mixed_instance &&
            formik.setFieldValue(
              'spotInstance',
              (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
            )
          const updatedGatewayDetails = { ...props.gatewayDetails }
          // eslint-disable-next-line
          updatedGatewayDetails.routing.instance.scale_group = {
            ...props.gatewayDetails.routing.instance.scale_group,
            on_demand: numericVal, // eslint-disable-line
            // eslint-disable-next-line
            ...(selectedAsg?.mixed_instance && {
              spot: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
            })
          }
          props.setGatewayDetails(updatedGatewayDetails)
        }
        break
      case 'SPOT':
        if (Utils.isNumber(val)) {
          const numericVal = Number(val)
          formik.setFieldValue('spotInstance', numericVal)
          formik.setFieldValue(
            'odInstance',
            (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
          )
          const updatedGatewayDetails = { ...props.gatewayDetails }
          // eslint-disable-next-line
          updatedGatewayDetails.routing.instance.scale_group = {
            ...props.gatewayDetails.routing.instance.scale_group,
            spot: numericVal,
            on_demand: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
          }
          props.setGatewayDetails(updatedGatewayDetails)
        }
        break
    }
  }

  return (
    <Layout.Vertical ref={configContEl} className={css.page}>
      <COFixedDrawer
        topMargin={85}
        content={<COHelpSidebar pageName="configuration" activeSectionNames={activeDrawerIds} />}
      />
      <Container style={{ paddingTop: 10 }}>
        <Layout.Vertical spacing="large" padding="large">
          <COGatewayConfigStep
            count={1}
            title={getString('ce.co.autoStoppingRule.configuration.step1.title')}
            subTitle={getString('ce.co.autoStoppingRule.configuration.step1.subTitle')}
            totalStepsCount={4}
            id={CONFIG_STEP_IDS[0]}
          >
            <Layout.Horizontal>
              <Card interactive={false} className={css.displayCard}>
                <Icon name={props.gatewayDetails.provider.icon as IconName} size={30} />
                <Text style={{ marginTop: '5px' }} font="medium">
                  {props.gatewayDetails.provider.name}
                </Text>
              </Card>
              {/* <Layout.Vertical style={{}}> */}
              {/* <Layout.Horizontal spacing="large">

                </Layout.Horizontal> */}
              <Formik
                initialValues={{
                  gatewayName: props.gatewayDetails.name,
                  idleTime: props.gatewayDetails.idleTimeMins
                }}
                onSubmit={values => alert(JSON.stringify(values))}
                render={formik => (
                  <FormikForm className={css.step1Form}>
                    <Layout.Horizontal spacing="xxxlarge">
                      <Layout.Vertical className={css.formElement}>
                        <Text style={{ fontSize: 16, fontWeight: 500, color: '#0B0B0D' }}>AutoStopping Rule Name</Text>
                        <FormInput.Text
                          name="gatewayName"
                          label={getString('ce.co.gatewayConfig.name')}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldValue('gatewayName', e.target.value)
                            props.gatewayDetails.name = e.target.value
                            props.setGatewayDetails(props.gatewayDetails)
                            setGatewayName(e.target.value)
                          }}
                        />
                      </Layout.Vertical>
                      <Layout.Vertical className={css.formElement}>
                        <Text style={{ fontSize: 16, fontWeight: 500, color: '#0B0B0D' }}>
                          Idle Time (mins)
                          <Icon
                            name="info"
                            onClick={() => {
                              setDrawerOpen(true)
                            }}
                          ></Icon>
                        </Text>
                        <FormInput.Text
                          name="idleTime"
                          label={
                            <Layout.Horizontal spacing="small">
                              <Text>Idle time (mins)</Text>
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
                      </Layout.Vertical>
                    </Layout.Horizontal>
                  </FormikForm>
                )}
                validationSchema={Yup.object().shape({
                  gatewayName: Yup.string().trim().required('Rule Name is required field'),
                  idleTime: Yup.number().typeError('Idle time must be a number').required('Idle Time is required field')
                })}
              ></Formik>
              {/* </Layout.Vertical> */}
            </Layout.Horizontal>
          </COGatewayConfigStep>
          <COGatewayConfigStep
            count={2}
            title={getString('ce.co.autoStoppingRule.configuration.step2.title')}
            // subTitle={'You can manage multiple instances or a Auto Scaling group using and AutoStopping rule.'}
            subTitle={getString('ce.co.autoStoppingRule.configuration.step2.subTitle')}
            totalStepsCount={4}
            id={CONFIG_STEP_IDS[1]}
          >
            <Layout.Vertical className={css.step2Container}>
              <Text className={css.radioGroupTitle}>Select the resources to be managed by the rule</Text>
              <RadioGroup
                selectedValue={selectedResource?.valueOf()}
                onChange={e => {
                  setSelectedResource(e.currentTarget.value as RESOURCES)
                }}
                className={css.radioGroup}
              >
                {managedResources
                  .filter(resource => resource.providers.includes(props.gatewayDetails.provider.value))
                  .map(resourceItem => {
                    return <Radio key={resourceItem.value} label={resourceItem.label} value={resourceItem.value} />
                  })}
              </RadioGroup>
              {!_isEmpty(selectedResource) && (
                <Layout.Vertical style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, color: '#9293AB', marginBottom: 10 }}>
                    {selectedResource?.valueOf() === RESOURCES.INSTANCES
                      ? getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.instance')
                      : getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.asg')}
                  </Text>
                  <Text
                    style={{ cursor: 'pointer', color: '#0278D5' }}
                    onClick={selectedResource?.valueOf() === RESOURCES.INSTANCES ? openInstancesModal : openAsgModal}
                  >
                    {selectedResource?.valueOf() === RESOURCES.INSTANCES
                      ? `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.instance')}`
                      : `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.asg')}`}
                  </Text>
                </Layout.Vertical>
              )}
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
                    },
                    {
                      Header: '',
                      id: 'menu',
                      accessor: row => row.id,
                      width: '5%',
                      Cell: RemoveCell,
                      disableSortBy: true
                    }
                  ]}
                />
              ) : null}
              {!_isEmpty(selectedAsg) && (
                <Table<ASGMinimal>
                  data={[selectedAsg as ASGMinimal]}
                  bpTableProps={{}}
                  columns={[
                    {
                      accessor: 'name',
                      Header: 'Name and ID',
                      width: '16.5%',
                      Cell: NameCell
                    },
                    {
                      accessor: 'desired',
                      Header: 'Instances',
                      width: '10%',
                      Cell: TableCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'region',
                      Header: 'Region',
                      width: '16.5%',
                      Cell: TableCell
                    }
                  ]}
                />
              )}
            </Layout.Vertical>
          </COGatewayConfigStep>
          <COGatewayConfigStep
            count={3}
            title={getString('ce.co.autoStoppingRule.configuration.step3.title')}
            subTitle={selectedAsg ? getString('ce.co.autoStoppingRule.configuration.step3.subTitle') : ''}
            totalStepsCount={4}
            id={CONFIG_STEP_IDS[2]}
          >
            {!selectedAsg && (
              <Layout.Vertical>
                <CardSelect
                  data={instanceTypeCardData.filter(_instanceType =>
                    _instanceType.providers?.includes(props.gatewayDetails.provider.value)
                  )}
                  className={css.instanceTypeViewGrid}
                  onChange={item => {
                    setSelectedInstanceType(item)
                    props.gatewayDetails.fullfilment = (item as CardData).value
                    props.setGatewayDetails(props.gatewayDetails)
                    setFullfilment((item as CardData).value)
                    trackEvent('SelectedInstanceType', { value: item?.value || '' })
                  }}
                  renderItem={(item, _) => (
                    <Layout.Vertical spacing="large">
                      <img src={(item as CardData).icon} alt="" aria-hidden />
                    </Layout.Vertical>
                  )}
                  selected={selectedInstanceType}
                  cornerSelected={true}
                ></CardSelect>
                <Layout.Horizontal spacing="medium" className={css.instanceTypeNameGrid}>
                  {instanceTypeCardData
                    .filter(_instanceType => _instanceType.providers?.includes(props.gatewayDetails.provider.value))
                    .map(_item => {
                      return (
                        <Text font={{ align: 'center' }} style={{ fontSize: 12 }} key={_item.text}>
                          {_item.text}
                        </Text>
                      )
                    })}
                </Layout.Horizontal>
              </Layout.Vertical>
            )}
            {selectedAsg && (
              <Layout.Horizontal className={css.asgInstanceSelectionContianer}>
                <div className={css.asgInstanceDetails}>
                  <Text className={css.asgDetailRow}>
                    <span>Desired capacity: </span>
                    <span>{selectedAsg.desired}</span>
                  </Text>
                  <Text className={css.asgDetailRow}>
                    <span>Min capacity: </span>
                    <span>{selectedAsg.min}</span>
                  </Text>
                  <Text className={css.asgDetailRow}>
                    <span>Max capacity: </span>
                    <span>{selectedAsg.max}</span>
                  </Text>
                </div>
                <div className={css.asgInstanceFormContainer}>
                  <Formik
                    initialValues={{
                      odInstance: props.gatewayDetails.routing.instance.scale_group?.on_demand || selectedAsg.desired,
                      spotInstance: _get(props.gatewayDetails.routing.instance.scale_group, 'spot', 0)
                    }}
                    onSubmit={_ => {}} // eslint-disable-line
                    render={formik => (
                      <FormikForm>
                        <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
                          <Layout.Vertical className={css.instanceTypeInput}>
                            <FormInput.Text
                              name={'odInstance'}
                              inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                              label={
                                <Layout.Horizontal>
                                  <img src={odIcon} />
                                  <Text>On-Demand</Text>
                                </Layout.Horizontal>
                              }
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleAsgInstancesChange(formik, e.target.value, 'OD')
                              }
                            />
                          </Layout.Vertical>
                          <Layout.Vertical className={css.instanceTypeInput}>
                            <FormInput.Text
                              name={'spotInstance'}
                              inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                              disabled={!selectedAsg?.mixed_instance}
                              helperText={
                                !selectedAsg?.mixed_instance &&
                                getString('ce.co.autoStoppingRule.configuration.step3.policyNotEnabled')
                              }
                              label={
                                <Layout.Horizontal>
                                  <img src={spotIcon} />
                                  <Text>Spot</Text>
                                </Layout.Horizontal>
                              }
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleAsgInstancesChange(formik, e.target.value, 'SPOT')
                              }
                            />
                          </Layout.Vertical>
                        </Layout.Horizontal>
                      </FormikForm>
                    )}
                    validationSchema={Yup.object().shape({
                      odInstance: Yup.number()
                        .required()
                        .positive()
                        .min(0)
                        .max(selectedAsg.max as number),
                      spotInstance: Yup.number()
                        .positive()
                        .min(0)
                        .max(selectedAsg.max as number)
                    })}
                  ></Formik>
                </div>
              </Layout.Horizontal>
            )}
          </COGatewayConfigStep>
          <COGatewayConfigStep
            count={4}
            title={getString('ce.co.autoStoppingRule.configuration.step4.title')}
            totalStepsCount={4}
            id={CONFIG_STEP_IDS[3]}
          >
            {selectedInstances.length || !_isEmpty(selectedAsg) ? (
              <Container style={{ justifyContent: 'center', maxWidth: '947px' }}>
                <Container className={css.configTab}>
                  <Tabs
                    id="tabsId1"
                    selectedTabId={activeConfigTabId}
                    onChange={tabId => tabId !== activeConfigTabId && setActiveConfigTabId(tabId as string)}
                  >
                    <Tab
                      id="routing"
                      title="Routing"
                      panel={
                        <Container style={{ backgroundColor: '#FBFBFB' }}>
                          <Layout.Vertical spacing="large">
                            {!selectedAsg && loading ? (
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
                                {getString('ce.co.gatewayConfig.addPortLabel')}
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
                              label={getString('ce.co.gatewayConfig.healthCheck')}
                              className={css.switchFont}
                              onChange={e => {
                                setHealthCheck(e.currentTarget.checked)
                              }}
                              checked={healthCheck}
                            />
                            {healthCheck ? (
                              <COHealthCheckTable pattern={healthCheckPattern} updatePattern={setHealthCheckPattern} />
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
                              label={getString('ce.co.gatewayConfig.allowTraffic')}
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
                              label={getString('ce.co.gatewayConfig.usePrivateIP')}
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
                                style={{ color: 'var(--primary-7)', cursor: 'pointer' }}
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
          </COGatewayConfigStep>
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export default COGatewayConfig

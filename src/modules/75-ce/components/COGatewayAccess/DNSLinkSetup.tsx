import React, { useEffect, useState } from 'react'
import {
  Heading,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Color,
  Text,
  useModalHook,
  SelectOption,
  Container,
  Select,
  Checkbox,
  Button,
  Tabs,
  Icon,
  Switch
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { debounce as _debounce, isEmpty as _isEmpty, values as _values } from 'lodash-es'
import { Dialog, IDialogProps, Radio, Tab } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  AccessPoint,
  AccessPointCore,
  ALBAccessPointCore,
  TargetGroupMinimal,
  useAccessPointResources,
  useAllHostedZones,
  useListAccessPoints,
  AzureAccessPointCore,
  ListAccessPointsQueryParams,
  PortConfig,
  useSecurityGroupsOfInstances,
  HealthCheck
} from 'services/lw'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useGatewayContext } from '@ce/context/GatewayContext'
import { useToaster } from '@common/exports'
import { portProtocolMap } from '@ce/constants'
import CreateAccessPointWizard from './CreateAccessPointWizard'
import type { ConnectionMetadata, CustomDomainDetails, GatewayDetails } from '../COCreateGateway/models'
import { Utils } from '../../common/Utils'
import LoadBalancerDnsConfig from './LoadBalancerDnsConfig'
import AzureAPConfig from '../COAccessPointList/AzureAPConfig'
import CORoutingTable from '../COGatewayConfig/CORoutingTable'
import COHealthCheckTable from '../COGatewayConfig/COHealthCheckTable'
import css from './COGatewayAccess.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

interface DNSLinkSetupProps {
  gatewayDetails: GatewayDetails
  setHelpTextSections: (s: string[]) => void
  setGatewayDetails: (gw: GatewayDetails) => void
  onInfoIconClick?: () => void
  activeStepDetails?: { count?: number; tabId?: string } | null
}

const DNSLinkSetup: React.FC<DNSLinkSetupProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const { isEditFlow } = useGatewayContext()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const [activeConfigTabId, setActiveConfigTabId] = useState<string | undefined>(props.activeStepDetails?.tabId)

  const accessDetails = props.gatewayDetails.metadata.access_details as ConnectionMetadata // eslint-disable-line
  const customDomainProviderDetails = props.gatewayDetails.metadata.custom_domain_providers as CustomDomainDetails // eslint-disable-line
  const {
    data: hostedZones,
    loading: hostedZonesLoading,
    refetch: loadHostedZones
  } = useAllHostedZones({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      region: 'us-east-1',
      domain: props.gatewayDetails.customDomains?.length ? props.gatewayDetails.customDomains[0] : '',
      accountIdentifier: accountId
    },
    lazy: true
  })

  // const debouncedFetchHostedZones = React.useCallback(_debounce(loadHostedZones, 500), [])

  const debouncedCustomDomainTextChange = React.useCallback(
    _debounce((value: string, shouldLoadHostedZones: boolean) => {
      const updatedGatewayDetails = { ...props.gatewayDetails }
      if (!updatedGatewayDetails.metadata.custom_domain_providers) {
        updatedGatewayDetails.metadata = {
          ...props.gatewayDetails.metadata,
          custom_domain_providers: { others: {} } // eslint-disable-line
        }
      }
      updatedGatewayDetails.customDomains = value.split(',')
      props.setGatewayDetails(updatedGatewayDetails)
      props.setHelpTextSections(['usingCustomDomain'])
      shouldLoadHostedZones && loadHostedZones()
    }, 500),
    [props.gatewayDetails]
  )

  const initialAccessPointDetails: AccessPoint = {
    cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    org_id: orgIdentifier, // eslint-disable-line
    metadata: {
      security_groups: [], // eslint-disable-line
      dns: {}
    },
    type: props.gatewayDetails.provider.value,
    region: props.gatewayDetails.selectedInstances?.length
      ? props.gatewayDetails.selectedInstances[0].region
      : !_isEmpty(props.gatewayDetails.routing?.instance?.scale_group?.region)
      ? props.gatewayDetails.routing?.instance?.scale_group?.region
      : '',
    vpc: props.gatewayDetails.selectedInstances?.length
      ? props.gatewayDetails.selectedInstances[0].vpc
      : !_isEmpty(props.gatewayDetails.routing?.instance?.scale_group?.target_groups)
      ? (props.gatewayDetails.routing?.instance?.scale_group?.target_groups as TargetGroupMinimal[])[0].vpc
      : ''
  }

  // const [accessPointsList, setAccessPointsList] = useState<SelectOption[]>([])
  const [apCoreList, setApCoreList] = useState<SelectOption[]>([])
  const [apCoreResponseList, setApCoreResponseList] = useState<AccessPointCore[]>([])
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    customDomainProviderDetails?.route53?.hosted_zone_id ? 'route53' : 'others'
  )
  const [selectedLoadBalancer, setSelectedLoadBalancer] = useState<AccessPointCore>()
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)

  const [accessPoint, setAccessPoint] = useState<AccessPoint>()
  const [selectedApCore, setSelectedApCore] = useState<SelectOption>()
  const [routingRecords, setRoutingRecords] = useState<PortConfig[]>(props.gatewayDetails.routing.ports)
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck | null>(props.gatewayDetails.healthCheck)

  const getAccessPointFetchQueryParams = (): ListAccessPointsQueryParams => {
    const params: ListAccessPointsQueryParams = {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
    if (isAwsProvider) {
      params.region = props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].region
        : props.gatewayDetails.routing.instance.scale_group?.region || ''
      params.vpc = props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].vpc
        : props.gatewayDetails.routing.instance.scale_group?.target_groups?.[0]?.vpc || ''
    }
    return params
  }

  const {
    data: accessPoints,
    loading: accessPointsLoading,
    refetch: refetchAccessPoints
  } = useListAccessPoints({
    account_id: accountId, // eslint-disable-line
    queryParams: getAccessPointFetchQueryParams()
  })

  const {
    data: apCoresResponse,
    loading: apCoresLoading,
    refetch: apCoresRefetch
  } = useAccessPointResources({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].region
        : props.gatewayDetails.routing.instance.scale_group?.region || '',
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      resource_group_name: props.gatewayDetails.selectedInstances[0]?.metadata?.resourceGroup,
      accountIdentifier: accountId
    }
  })

  const { mutate: getSecurityGroups, loading: loadingSecurityGroups } = useSecurityGroupsOfInstances({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (accessPoints?.response?.length == 0) {
      return
    }
    if (props.gatewayDetails.accessPointID) {
      const targetAp = accessPoints?.response?.find(_ap => _ap.id === props.gatewayDetails.accessPointID)
      if (targetAp) {
        setAccessPoint(targetAp)
      }
    }
  }, [accessPoints?.response])

  useEffect(() => {
    const submittedAccessPoints = accessPoints?.response?.filter(_item => _item.status === 'submitted')
    if (apCoresResponse?.response?.length == 0 && _isEmpty(submittedAccessPoints)) {
      return
    }

    const apCoresResponseMap: Record<string, AccessPointCore> = {}
    apCoresResponse?.response?.forEach(_item => {
      apCoresResponseMap[_item.details?.name as string] = _item
    })

    submittedAccessPoints?.forEach(_item => {
      apCoresResponseMap[_item.name as string] = getDummySupportedResourceFromAG(_item)
    })
    setApCoreResponseList(_values(apCoresResponseMap))
  }, [apCoresResponse?.response, accessPoints?.response])

  useEffect(() => {
    const loaded: SelectOption[] =
      apCoreResponseList?.map(_ap => {
        return {
          label: _ap.details?.name as string,
          value: isAwsProvider
            ? ((_ap.details as ALBAccessPointCore)?.albARN as string)
            : isAzureProvider
            ? ((_ap.details as AzureAccessPointCore).id as string)
            : ''
        }
      }) || []
    setApCoreList(loaded)
  }, [apCoreResponseList])

  useEffect(() => {
    const resourceId = isAwsProvider
      ? accessPoint?.metadata?.albArn
      : accessPoint?.metadata?.app_gateway_id || accessPoint?.id // handled case for "submitted" state access points
    const selectedResource = resourceId && apCoreList.find(_item => _item.value === resourceId)
    if (selectedResource) {
      setSelectedApCore(selectedResource)
    }
  }, [accessPoint, apCoreList])

  useEffect(() => {
    if (hostedZonesLoading) return
    if (hostedZones?.response?.length == 0) {
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setHostedZonesList(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading])

  useEffect(() => {
    if (dnsProvider == 'route53') loadHostedZones()
  }, [dnsProvider])

  useEffect(() => {
    if (routingRecords.length) {
      return
    }
    fetchInstanceSecurityGroups()
  }, [])

  useEffect(() => {
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      routing: { ...props.gatewayDetails.routing, ports: routingRecords }
    }
    props.setGatewayDetails(updatedGatewayDetails)
  }, [routingRecords])

  const [, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <CreateAccessPointWizard
        accessPoint={initialAccessPointDetails}
        closeModal={hideModal}
        setAccessPoint={setAccessPoint}
        refreshAccessPoints={refetchAccessPoints}
        isRuleCreationMode={true}
      />
    </Dialog>
  ))

  const addPort = () => {
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

  const addAllPorts = () => {
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

  const fetchInstanceSecurityGroups = async (): Promise<void> => {
    const emptyRecords: PortConfig[] = []
    try {
      let text = `id = ['${
        props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].id : ''
      }']\nregions = ['${
        props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].region : ''
      }']`

      if (isAzureProvider) {
        text += `\nresource_groups=['${
          props.gatewayDetails.selectedInstances
            ? props.gatewayDetails.selectedInstances[0].metadata?.resourceGroup
            : ''
        }']`
      }

      const result = await getSecurityGroups({
        text
      })
      if (result && result.response) {
        Object.keys(result.response).forEach(instance => {
          result.response?.[instance].forEach(sg => {
            sg?.inbound_rules?.forEach(rule => {
              if (rule.protocol == '-1' || rule.from === '*') {
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
      showError(e.data?.message || e.message, undefined, 'ce.creaetap.result.error')
    }
  }

  const clearAPData = () => {
    setSelectedApCore({ label: '', value: '' })
    updateLoadBalancerDetails()
    setSelectedLoadBalancer(undefined)
  }

  const getDummySupportedResourceFromAG = (ag: AccessPoint): AccessPointCore => {
    return {
      type: 'app_gateway',
      details: {
        fe_ip_id: ag.metadata?.fe_ip_id,
        id: ag.id,
        name: ag.name,
        region: ag.region,
        resource_group: ag.metadata?.resource_group,
        size: ag.metadata?.size,
        subnet_id: ag.metadata?.subnet_id,
        vpc: ag.vpc
      }
    }
  }

  const [openLoadBalancerModal, hideLoadBalancerModal] = useModalHook(() => {
    return (
      <Dialog onClose={hideLoadBalancerModal} {...modalPropsLight}>
        {isAwsProvider && (
          <LoadBalancerDnsConfig
            loadBalancer={
              isCreateMode
                ? initialAccessPointDetails
                : createApDetailsFromLoadBalancer(selectedLoadBalancer as AccessPointCore)
            }
            cloudAccountId={props.gatewayDetails.cloudAccount.id}
            onClose={_clearStatus => {
              if (_clearStatus && !isCreateMode) {
                clearAPData()
              }
              if (isCreateMode) setIsCreateMode(false)
              hideLoadBalancerModal()
            }}
            createMode={isCreateMode}
            onSave={savedLb => {
              setAccessPoint(savedLb)
              if (isCreateMode) {
                setIsCreateMode(false)
                apCoresRefetch()
              }
            }}
          />
        )}
        {isAzureProvider && (
          <AzureAPConfig
            cloudAccountId={props.gatewayDetails.cloudAccount.id}
            onSave={savedLb => {
              setAccessPoint(savedLb)
              if (isCreateMode) {
                refetchAccessPoints()
                setIsCreateMode(false)
                // apCoresRefetch()
              }
            }}
            createMode={isCreateMode}
            onClose={_clearStatus => {
              if (_clearStatus && !isCreateMode) {
                clearAPData()
              }
              if (isCreateMode) setIsCreateMode(false)
              hideLoadBalancerModal()
            }}
            loadBalancer={createAzureAppGatewayFromLoadBalancer()}
          />
        )}
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideLoadBalancerModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, [selectedLoadBalancer, isCreateMode])

  useEffect(() => {
    if (!accessPoint || !accessPoint.id) return
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      accessPointID: accessPoint.id,
      accessPointData: accessPoint
    }
    props.setGatewayDetails(updatedGatewayDetails)
    // setGeneratedHostName(generateHostName(accessPoint.host_name as string))
  }, [accessPoint])

  const createApDetailsFromLoadBalancer = (currLoadBalancer: AccessPointCore): AccessPoint => {
    return {
      ...initialAccessPointDetails,
      name: currLoadBalancer.details?.name,
      ...((currLoadBalancer.details as ALBAccessPointCore)?.vpc && {
        vpc: (currLoadBalancer.details as ALBAccessPointCore).vpc
      }),
      metadata: {
        ...initialAccessPointDetails.metadata,
        ...((currLoadBalancer.details as ALBAccessPointCore)?.security_groups && {
          security_groups: (currLoadBalancer.details as ALBAccessPointCore).security_groups
        }),
        ...((currLoadBalancer.details as ALBAccessPointCore)?.albARN && {
          albArn: (currLoadBalancer.details as ALBAccessPointCore).albARN
        })
      }
    }
  }

  const createAzureAppGatewayFromLoadBalancer = (): AccessPoint => {
    const details = isCreateMode ? {} : (selectedLoadBalancer?.details as AzureAccessPointCore)
    return {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      account_id: accountId, // eslint-disable-line
      project_id: projectIdentifier, // eslint-disable-line
      org_id: orgIdentifier, // eslint-disable-line
      region: details?.region,
      vpc: details?.vpc,
      name: details?.name,
      type: props.gatewayDetails.provider.value,
      metadata: {
        app_gateway_id: details?.id, // eslint-disable-line
        fe_ip_id: details?.fe_ip_id, // eslint-disable-line
        resource_group: details?.resource_group, // eslint-disable-line
        size: details?.size,
        subnet_id: details?.subnet_id // eslint-disable-line
      }
    }
  }

  const updateLoadBalancerDetails = (_accessPointDetails?: AccessPoint) => {
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      accessPointID: _accessPointDetails?.id || '',
      accessPointData: _accessPointDetails
      // hostName: generateHostName(_accessPointDetails?.host_name || '')
    }
    props.setGatewayDetails(updatedGatewayDetails)
    // setGeneratedHostName(updatedGatewayDetails.hostName || getString('ce.co.dnsSetup.autoURL'))
  }

  const isValidLoadBalancer = (lb: AccessPointCore) => {
    let isValid = false
    if (isAwsProvider) {
      isValid = Boolean(
        lb &&
          accessPoints?.response
            ?.map(_ap => _ap.metadata?.albArn)
            ?.filter(_i => _i)
            ?.includes((lb.details as ALBAccessPointCore)?.albARN)
      )
      if (!isValid) {
        isValid = Boolean(lb && accessPoint?.metadata?.albArn === (lb.details as ALBAccessPointCore)?.albARN)
      }
    }
    if (isAzureProvider) {
      isValid = Boolean(
        lb &&
          accessPoints?.response
            ?.map(_ap => (_ap.status === 'submitted' ? _ap.id : _ap.metadata?.app_gateway_id))
            .filter(_i => _i)
            .includes((lb.details as AzureAccessPointCore).id)
      )
      if (!isValid) {
        isValid = Boolean(lb && accessPoint?.metadata?.app_gateway_id === (lb.details as AzureAccessPointCore)?.id)
      }
    }
    return isValid
  }

  const handleLoadBalancerSelection = (item: SelectOption) => {
    setSelectedApCore(item)
    const matchedLb = apCoreResponseList?.find(_lb =>
      isAwsProvider
        ? item.value === (_lb.details as ALBAccessPointCore)?.albARN
        : item.value === (_lb.details as AzureAccessPointCore)?.id
    )
    setSelectedLoadBalancer(matchedLb)
    if (isValidLoadBalancer(matchedLb as AccessPointCore)) {
      let linkedAccessPoint = accessPoints?.response?.find(_ap =>
        isAwsProvider
          ? _ap.metadata?.albArn === (matchedLb?.details as ALBAccessPointCore)?.albARN
          : (_ap.metadata?.app_gateway_id || _ap.id) === (matchedLb?.details as AzureAccessPointCore)?.id
      )
      if (!linkedAccessPoint) {
        linkedAccessPoint = accessPoint
      }

      // Use only those Access Points which are not in errored state.
      if (linkedAccessPoint?.status === 'errored') {
        showError(getString('ce.co.autoStoppingRule.setupAccess.erroredAccessPointSelectionText'))
        clearAPData()
      } else {
        updateLoadBalancerDetails(linkedAccessPoint)
      }
    } else {
      isCreateMode && setIsCreateMode(false)
      openLoadBalancerModal()
    }
  }

  const handleCreateNewLb = () => {
    setIsCreateMode(true)
    trackEvent('MadeNewAccessPoint', {})
    openLoadBalancerModal()
  }

  const updateGatewayHealthCheck = (_healthCheckDetails: HealthCheck | null) => {
    const updatedGatewayDetails = { ...props.gatewayDetails, healthCheck: _healthCheckDetails }
    props.setGatewayDetails(updatedGatewayDetails)
  }

  const handleHealthCheckToggle = (toggleStatus: boolean) => {
    const hcData = toggleStatus ? Utils.getDefaultRuleHealthCheck() : null
    setHealthCheckPattern(hcData)
    updateGatewayHealthCheck(hcData)
  }

  const handleUpdatePattern = (_data: HealthCheck) => {
    setHealthCheckPattern(_data)
    updateGatewayHealthCheck(_data)
  }

  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)

  return (
    <Layout.Vertical spacing="medium" padding="medium">
      <Heading level={3}>{getString('ce.co.gatewayAccess.dnsLinkHeader')}</Heading>

      <Formik
        initialValues={{
          usingCustomDomain: props.gatewayDetails.customDomains?.length ? 'yes' : 'no',
          customURL: props.gatewayDetails.customDomains?.join(','),
          publicallyAccessible: (accessDetails.dnsLink.public as string) || 'yes',
          dnsProvider: customDomainProviderDetails
            ? customDomainProviderDetails.route53
              ? 'route53'
              : 'others'
            : 'route53',
          route53Account:
            customDomainProviderDetails && customDomainProviderDetails.route53
              ? customDomainProviderDetails.route53.hosted_zone_id
              : ''
          // accessPoint: props.gatewayDetails.accessPointID
        }}
        formName="dnsLinkSetup"
        enableReinitialize={true}
        onSubmit={values => alert(JSON.stringify(values))}
        validationSchema={Yup.object().shape({
          customURL: Yup.string()
            .trim()
            .matches(
              /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
              'Enter a valid URL'
            )
            .required()
        })}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="large">
              <Container className={css.dnsLinkContainer}>
                <Heading level={3} font={{ weight: 'bold' }} className={css.header}>
                  {getString(
                    isAwsProvider
                      ? 'ce.co.autoStoppingRule.setupAccess.selectLb'
                      : 'ce.co.autoStoppingRule.setupAccess.selectAppGateway'
                  )}
                </Heading>
                <Layout.Horizontal className={css.selectLoadBalancerContainer}>
                  {/* <img src={loadBalancerSvg} className={css.helperImage} /> */}
                  <div>
                    <Text className={css.helpText}>
                      {getString('ce.co.autoStoppingRule.setupAccess.selectLbHelpText')}
                    </Text>
                    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Select
                        name="accessPoint"
                        // label={getString('ce.co.autoStoppingRule.setupAccess.chooseLbText')}
                        items={apCoreList}
                        onChange={e => {
                          // formik.setFieldValue('accessPoint', e.value)
                          handleLoadBalancerSelection(e)
                          trackEvent('SelectingAccessPoint', {})
                        }}
                        value={selectedApCore}
                        disabled={isEditFlow || accessPointsLoading || apCoresLoading}
                        className={css.loadBalancerSelector}
                      />
                      {!isEditFlow && (
                        <Text color={Color.PRIMARY_6} onClick={handleCreateNewLb} style={{ cursor: 'pointer' }}>
                          {'+' +
                            (isAwsProvider
                              ? getString('ce.co.accessPoint.new')
                              : getString('ce.co.accessPoint.newAppGateway'))}
                        </Text>
                      )}
                    </Layout.Horizontal>
                  </div>
                </Layout.Horizontal>
              </Container>
              <Container className={css.dnsLinkContainer}>
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
                        {!isK8sRule && (
                          <>
                            <Text className={css.titleHelpTextDescription}>
                              {getString('ce.co.gatewayConfig.routingDescription')}
                            </Text>
                            <Layout.Vertical spacing="large">
                              {loadingSecurityGroups ? (
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
                          </>
                        )}
                      </Container>
                    }
                  />
                  <Tab
                    id="healthcheck"
                    title="Health check"
                    panel={
                      <Container style={{ backgroundColor: '#FBFBFB' }}>
                        <Text className={css.titleHelpTextDescription}>
                          {getString('ce.co.gatewayConfig.healthCheckDescription')}
                        </Text>
                        <Layout.Vertical spacing="large" padding="large">
                          <Switch
                            label={getString('ce.co.gatewayConfig.healthCheck')}
                            className={css.switchFont}
                            onChange={e => {
                              handleHealthCheckToggle(e.currentTarget.checked)
                            }}
                            checked={!_isEmpty(healthCheckPattern)}
                          />
                          {healthCheckPattern && (
                            <COHealthCheckTable pattern={healthCheckPattern} updatePattern={handleUpdatePattern} />
                          )}
                        </Layout.Vertical>
                      </Container>
                    }
                  />
                </Tabs>
              </Container>
              <Container className={css.dnsLinkContainer}>
                <Layout.Horizontal spacing="small" style={{ marginBottom: 'var(--spacing-xlarge)' }}>
                  <Heading level={3} font={{ weight: 'light' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.customDomain.helpText')}
                  </Heading>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Radio
                    value="no"
                    onChange={e => {
                      formik.setFieldValue('usingCustomDomain', e.currentTarget.value)
                      if (e.currentTarget.value == 'no') props.setHelpTextSections([])
                      formik.setFieldValue('customURL', '')
                      props.gatewayDetails.customDomains = []
                      props.setGatewayDetails(props.gatewayDetails)
                    }}
                    checked={formik.values.usingCustomDomain == 'no'}
                  />
                  <Layout.Vertical spacing="xsmall">
                    {/* <Text
                      style={{
                        fontSize: 'var(--font-size-normal)',
                        fontWeight: 500,
                        lineHeight: '20px',
                        color: 'var(--grey-800)'
                      }}
                    >
                      {generatedHostName}
                    </Text> */}
                    <Text
                      color={Color.GREY_500}
                      style={{
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '18px',
                        color: 'var(--grey-800)',
                        paddingBottom: 'var(--spacing-small)'
                      }}
                    >
                      {getString('ce.co.autoStoppingRule.setupAccess.autogeneratedHelpText')}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal style={{ width: '100%' }}>
                  <Radio
                    value="yes"
                    onChange={e => {
                      formik.setFieldValue('usingCustomDomain', e.currentTarget.value)
                      debouncedCustomDomainTextChange('', false)
                    }}
                    checked={formik.values.usingCustomDomain == 'yes'}
                    className={css.centerAlignedRadio}
                    name={'usingCustomDomain'}
                  />
                  <FormInput.Text
                    name="customURL"
                    placeholder={getString('ce.co.dnsSetup.customURL')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue('customURL', e.target.value)
                      debouncedCustomDomainTextChange(e.target.value, true)
                      // debouncedFetchHostedZones()
                    }}
                    style={{ width: '100%' }}
                    disabled={formik.values.usingCustomDomain != 'yes'}
                  />
                </Layout.Horizontal>
                <Checkbox
                  name="publicallyAccessible"
                  label={'This url is publicly accessible'}
                  onChange={() => {
                    const cbVal = Utils.booleanToString(formik.values.publicallyAccessible !== 'yes')
                    formik.setFieldValue('publicallyAccessible', cbVal)
                    accessDetails.dnsLink.public = cbVal
                    const updatedGatewayDetails = { ...props.gatewayDetails }
                    updatedGatewayDetails.metadata.access_details = accessDetails // eslint-disable-line
                    props.setGatewayDetails(updatedGatewayDetails)
                  }}
                  checked={formik.values.publicallyAccessible === 'yes'}
                  className={css.publicAccessibleCheckboxContainer}
                />
              </Container>

              {formik.values.customURL && isAwsProvider && (
                <Container className={css.dnsLinkContainer}>
                  <Layout.Vertical spacing="medium">
                    <Heading level={3} font={{ weight: 'bold' }}>
                      Map your Custom domain to the hostname
                    </Heading>
                    <Text font={{ weight: 'light' }} color="Color.GREY_500" className={css.mapDomainHelperText}>
                      Since you have opted to access instances using a Custom domain, you need to map if to the
                      hostname. Select your preferred DNS provider
                    </Text>
                    <Layout.Vertical>
                      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                        <Radio
                          value="route53"
                          checked={formik.values.dnsProvider === 'route53'}
                          onChange={e => {
                            formik.setFieldValue('dnsProvider', e.currentTarget.value)
                            setDNSProvider(e.currentTarget.value)
                            const updatedGatewayDetails = { ...props.gatewayDetails }
                            updatedGatewayDetails.metadata = {
                              ...props.gatewayDetails.metadata,
                              custom_domain_providers: { route53: {} } // eslint-disable-line
                            }
                            props.setGatewayDetails(updatedGatewayDetails)
                            props.setHelpTextSections(['usingCustomDomain'])
                          }}
                          name={'route53RadioBtn'}
                        />
                        <FormInput.Select
                          name="route53Account"
                          placeholder={getString('ce.co.accessPoint.select.route53')}
                          items={hostedZonesList}
                          onChange={e => {
                            formik.setFieldValue('route53Account', e.value)
                            const updatedGatewayDetails = { ...props.gatewayDetails }
                            updatedGatewayDetails.metadata = {
                              ...props.gatewayDetails.metadata,
                              //eslint-disable-next-line
                              custom_domain_providers: {
                                route53: { hosted_zone_id: e.value as string } // eslint-disable-line
                              }
                            }
                            props.setGatewayDetails(updatedGatewayDetails)
                          }}
                        />
                      </Layout.Horizontal>
                      <Radio
                        value="others"
                        checked={formik.values.dnsProvider === 'others'}
                        label="Others"
                        onChange={e => {
                          formik.setFieldValue('dnsProvider', e.currentTarget.value)
                          setDNSProvider(e.currentTarget.value)
                          const updatedGatewayDetails = { ...props.gatewayDetails }
                          updatedGatewayDetails.metadata = {
                            ...props.gatewayDetails.metadata,
                            custom_domain_providers: { others: {} } // eslint-disable-line
                          }
                          props.setGatewayDetails(updatedGatewayDetails)
                          props.setHelpTextSections(['usingCustomDomain', 'dns-others'])
                        }}
                      />
                    </Layout.Vertical>
                  </Layout.Vertical>
                </Container>
              )}
            </Layout.Vertical>
          </FormikForm>
        )}
      ></Formik>
    </Layout.Vertical>
  )
}

export default DNSLinkSetup

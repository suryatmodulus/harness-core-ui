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
  Checkbox
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { debounce as _debounce, isEmpty as _isEmpty } from 'lodash-es'
import { Dialog, IDialogProps, Radio } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  AccessPoint,
  AccessPointCore,
  ALBAccessPointCore,
  TargetGroupMinimal,
  useAccessPointResources,
  useAllHostedZones,
  useListAccessPoints,
  AzureAccessPointCore
} from 'services/lw'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useTelemetry } from '@common/hooks/useTelemetry'
import CreateAccessPointWizard from './CreateAccessPointWizard'
import type { ConnectionMetadata, CustomDomainDetails, GatewayDetails } from '../COCreateGateway/models'
import { cleanupForHostName } from '../COGatewayList/Utils'
import { Utils } from '../../common/Utils'
import LoadBalancerDnsConfig from './LoadBalancerDnsConfig'
import AzureAPConfig from '../COAccessPointList/AzureAPConfig'
import loadBalancerSvg from './images/loadbalancer.svg'
import css from './COGatewayAccess.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
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
}

const DNSLinkSetup: React.FC<DNSLinkSetupProps> = props => {
  const { showWarning } = useToaster()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const accessDetails = props.gatewayDetails.metadata.access_details as ConnectionMetadata // eslint-disable-line
  const customDomainProviderDetails = props.gatewayDetails.metadata.custom_domain_providers as CustomDomainDetails // eslint-disable-line
  const { data: hostedZones, loading: hostedZonesLoading, refetch: loadHostedZones } = useAllHostedZones({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      region: 'us-east-1',
      domain: props.gatewayDetails.customDomains?.length ? props.gatewayDetails.customDomains[0] : ''
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
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    customDomainProviderDetails?.route53?.hosted_zone_id ? 'route53' : 'others'
  )
  const [selectedLoadBalancer, setSelectedLoadBalancer] = useState<AccessPointCore>()
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [generatedHostName, setGeneratedHostName] = useState<string>(
    (props.gatewayDetails.hostName as string) || getString('ce.co.dnsSetup.autoURL')
  )
  const [accessPoint, setAccessPoint] = useState<AccessPoint>()
  const [selectedApCore, setSelectedApCore] = useState<SelectOption>()

  const { data: accessPoints, loading: accessPointsLoading, refetch } = useListAccessPoints({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].region
        : props.gatewayDetails.routing.instance.scale_group?.region || '',
      vpc: props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].vpc
        : props.gatewayDetails.routing.instance.scale_group?.target_groups?.[0]?.vpc || '',
      cloud_account_id: props.gatewayDetails.cloudAccount.id // eslint-disable-line
    }
  })

  const { data: apCoresResponse, loading: apCoresLoading, refetch: apCoresRefetch } = useAccessPointResources({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      region: props.gatewayDetails.selectedInstances?.length
        ? props.gatewayDetails.selectedInstances[0].region
        : props.gatewayDetails.routing.instance.scale_group?.region || '',
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      resource_group_name: props.gatewayDetails.selectedInstances[0].metadata?.resourceGroup
    }
  })

  function generateHostName(val: string): string {
    return `${cleanupForHostName(orgIdentifier)}-${cleanupForHostName(
      props.gatewayDetails.name
    )}.${val}`.toLocaleLowerCase()
  }

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
    if (apCoresResponse?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      apCoresResponse?.response?.map(_ap => {
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
  }, [apCoresResponse?.response])

  useEffect(() => {
    const albArn = accessPoint?.metadata?.albArn
    const selectedResource = albArn && apCoreList.find(_item => _item.value === albArn)
    if (selectedResource) {
      setSelectedApCore(selectedResource)
    }
  }, [accessPoint, apCoreList])

  useEffect(() => {
    if (hostedZonesLoading) return
    if (hostedZones?.response?.length == 0) {
      if (props.gatewayDetails.customDomains?.length) {
        showWarning(getString('ce.co.autoStoppingRule.setupAccess.customDomain.noHostedZones'))
      }
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

  const [, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <CreateAccessPointWizard
        accessPoint={initialAccessPointDetails}
        closeModal={hideModal}
        setAccessPoint={setAccessPoint}
        refreshAccessPoints={refetch}
        isRuleCreationMode={true}
      />
    </Dialog>
  ))

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
            onClose={hideLoadBalancerModal}
            createMode={isCreateMode}
            onSave={savedLb => {
              setAccessPoint(savedLb)
              if (isCreateMode) {
                // setAccessPointsList([{ label: savedLb.name as string, value: savedLb.id as string }, ...accessPointsList])
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
            }}
            createMode={true}
            onClose={hideLoadBalancerModal}
            loadBalancer={initialAccessPointDetails}
          />
        )}
      </Dialog>
    )
  }, [selectedLoadBalancer, isCreateMode])

  useEffect(() => {
    if (!accessPoint || !accessPoint.id) return
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.accessPointID = accessPoint.id
    props.setGatewayDetails(updatedGatewayDetails)
    setGeneratedHostName(generateHostName(accessPoint.host_name as string))
  }, [accessPoint])

  const createApDetailsFromLoadBalancer = (currLoadBalancer: AccessPointCore): AccessPoint => {
    return {
      ...initialAccessPointDetails,
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

  const updateLoadBalancerDetails = (accessPointId: string, hostname: string) => {
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.accessPointID = accessPointId
    updatedGatewayDetails.hostName = generateHostName(hostname)
    props.setGatewayDetails(updatedGatewayDetails)
    setGeneratedHostName(updatedGatewayDetails.hostName)
  }

  const isValidLoadBalancer = (lb: AccessPointCore) => {
    if (isAwsProvider) {
      return (
        lb &&
        accessPoints?.response
          ?.map(_ap => _ap.metadata?.albArn)
          ?.filter(_i => _i)
          ?.includes((lb.details as ALBAccessPointCore)?.albARN)
      )
    }
    if (isAzureProvider) {
      return (
        lb &&
        accessPoints?.response
          ?.map(_ap => _ap.metadata?.app_gateway_id)
          .filter(_i => _i)
          .includes((lb.details as AzureAccessPointCore).id)
      )
    }
  }

  const handleLoadBalancerSelection = (item: SelectOption) => {
    setSelectedApCore(item)
    const matchedLb = apCoresResponse?.response?.find(_lb =>
      isAwsProvider
        ? item.value === (_lb.details as ALBAccessPointCore)?.albARN
        : item.value === (_lb.details as AzureAccessPointCore)?.id
    )
    setSelectedLoadBalancer(matchedLb)
    if (isValidLoadBalancer(matchedLb as AccessPointCore)) {
      const linkedAccessPoint = accessPoints?.response?.find(_ap =>
        isAwsProvider
          ? _ap.metadata?.albArn === (matchedLb?.details as ALBAccessPointCore)?.albARN
          : _ap.metadata?.app_gateway_id === (matchedLb?.details as AzureAccessPointCore)?.id
      )
      updateLoadBalancerDetails(linkedAccessPoint?.id as string, linkedAccessPoint?.host_name as string)
    } else {
      isAwsProvider && openLoadBalancerModal()
    }
  }

  const handleCreateNewLb = () => {
    setIsCreateMode(true)
    trackEvent('MadeNewAccessPoint', {})
    openLoadBalancerModal()
  }

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
                  <img src={loadBalancerSvg} className={css.helperImage} />
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
                        disabled={accessPointsLoading || apCoresLoading}
                        className={css.loadBalancerSelector}
                      />
                      <Text color={Color.BLUE_500} onClick={handleCreateNewLb} style={{ cursor: 'pointer' }}>
                        {'+' +
                          (isAwsProvider
                            ? getString('ce.co.accessPoint.new')
                            : getString('ce.co.accessPoint.newAppGateway'))}
                      </Text>
                    </Layout.Horizontal>
                  </div>
                </Layout.Horizontal>
              </Container>
              <Container className={css.dnsLinkContainer}>
                <Layout.Horizontal spacing="small" style={{ paddingBottom: 'var(--spacing-small)' }}>
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
                    <Text style={{ fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '20px' }}>
                      {generatedHostName}
                    </Text>
                    <Text
                      color={Color.GREY_500}
                      style={{
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '18px',
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
                    {/* <RadioGroup
                      label=""
                      name="dnsProvider"
                      onChange={e => {
                        formik.setFieldValue('dnsProvider', e.currentTarget.value)
                        setDNSProvider(e.currentTarget.value)
                        if (e.currentTarget.value == 'others') {
                          const updatedGatewayDetails = { ...props.gatewayDetails }
                          updatedGatewayDetails.metadata = {
                            ...props.gatewayDetails.metadata,
                            custom_domain_providers: { others: {} } // eslint-disable-line
                          }
                          props.setGatewayDetails(updatedGatewayDetails)
                          props.setHelpTextSections(['usingCustomDomain', 'dns-others'])
                        } else {
                          const updatedGatewayDetails = { ...props.gatewayDetails }
                          updatedGatewayDetails.metadata = {
                            ...props.gatewayDetails.metadata,
                            custom_domain_providers: { route53: {} } // eslint-disable-line
                          }
                          props.setGatewayDetails(updatedGatewayDetails)
                          props.setHelpTextSections(['usingCustomDomain'])
                        }
                      }}
                      selectedValue={formik.values.dnsProvider}
                    >
                      <Radio label={getString('ce.co.accessPoint.route53')} value="route53" />
                      <Radio label={getString('ce.co.accessPoint.others')} value="others" />
                    </RadioGroup> */}
                    {/* {formik.values.dnsProvider == 'route53' ? (
                      <>
                        <FormInput.Select
                          name="route53Account"
                          label={getString('ce.co.accessPoint.select.route53')}
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
                      </>
                    ) : null} */}
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

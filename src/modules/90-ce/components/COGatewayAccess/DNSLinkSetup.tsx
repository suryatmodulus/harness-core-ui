import React, { useEffect, useState } from 'react'
import {
  Heading,
  Layout,
  Icon,
  Formik,
  FormikForm,
  FormInput,
  Button,
  Color,
  Text,
  useModalHook,
  SelectOption
} from '@wings-software/uicore'
import { Dialog, IDialogProps, RadioGroup, Radio } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { AccessPoint, useAllHostedZones, useListAccessPoints } from 'services/lw'
import { useStrings } from 'framework/exports'
import CreateAccessPointWizard from './CreateAccessPointWizard'
import type { ConnectionMetadata, CustomDomainDetails, GatewayDetails } from '../COCreateGateway/models'
import { cleanupForHostName } from '../COGatewayList/Utils'
import css from './COGatewayAccess.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface DNSLinkSetupProps {
  gatewayDetails: GatewayDetails
  setHelpTextSections: (s: string[]) => void
  setGatewayDetails: (gw: GatewayDetails) => void
}

const DNSLinkSetup: React.FC<DNSLinkSetupProps> = props => {
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
      region: 'us-east-1'
    },
    lazy: true
  })
  const initialAccessPointDetails: AccessPoint = {
    cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    org_id: orgIdentifier, // eslint-disable-line
    metadata: {
      security_groups: [], // eslint-disable-line
      dns: {}
    },
    type: 'aws',
    region: props.gatewayDetails.selectedInstances?.length ? props.gatewayDetails.selectedInstances[0].region : '',
    vpc: props.gatewayDetails.selectedInstances?.length ? props.gatewayDetails.selectedInstances[0].vpc : ''
  }

  const [accessPointsList, setAccessPointsList] = useState<SelectOption[]>([])
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    customDomainProviderDetails && customDomainProviderDetails.route53 ? 'route53' : 'others'
  )
  const [generatedHostName, setGeneratedHostName] = useState<string>(
    (props.gatewayDetails.hostName as string) || 'Auto generated URL'
  )
  const { getString } = useStrings()

  const { data: accessPoints, loading: accessPointsLoading, refetch } = useListAccessPoints({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: props.gatewayDetails.selectedInstances?.length ? props.gatewayDetails.selectedInstances[0].region : '',
      vpc: props.gatewayDetails.selectedInstances?.length ? props.gatewayDetails.selectedInstances[0].vpc : ''
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
    const loaded: SelectOption[] =
      accessPoints?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setAccessPointsList(loaded)
  }, [accessPoints])

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

  const [accessPoint, setAccessPoint] = useState<AccessPoint>()
  const [openModal, hideModal] = useModalHook(() => (
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
  useEffect(() => {
    if (!accessPoint || !accessPoint.id) return
    props.gatewayDetails.accessPointID = accessPoint.id
    props.setGatewayDetails(props.gatewayDetails)
    setGeneratedHostName(generateHostName(accessPoint.host_name as string))
  }, [accessPoint])
  return (
    <Layout.Vertical spacing="medium" padding="medium" style={{ backgroundColor: 'var(--grey-100)' }}>
      <Heading level={3}>A DNS Link lets you to connect to the Rule by matching human-readable domain names</Heading>

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
              : '',
          accessPoint: props.gatewayDetails.accessPointID
        }}
        enableReinitialize={true}
        onSubmit={values => alert(JSON.stringify(values))}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium">
              <Layout.Horizontal spacing="small" style={{ paddingBottom: 'var(--spacing-small)' }}>
                <Heading level={3} font={{ weight: 'light' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.customDomainHelpText')}
                </Heading>
                <Icon name="info"></Icon>
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
                  }}
                  checked={formik.values.usingCustomDomain == 'yes'}
                  className={css.centerAlignedRadio}
                />
                <FormInput.Text
                  name="customURL"
                  placeholder={'Custom URL (Example: qa.yourcompany.com)'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue('customURL', e.target.value)
                    props.gatewayDetails.customDomains = e.target.value.split(',')
                    props.setGatewayDetails(props.gatewayDetails)
                    props.setHelpTextSections(['usingCustomDomain'])
                  }}
                  style={{ width: '100%' }}
                  disabled={formik.values.usingCustomDomain != 'yes'}
                />
              </Layout.Horizontal>

              <>
                <RadioGroup
                  inline={true}
                  label="Is the URL publicly accessible?"
                  name="publicallyAccessible"
                  onChange={e => {
                    formik.setFieldValue('publicallyAccessible', e.currentTarget.value)
                    accessDetails.dnsLink.public = e.currentTarget.value
                    props.gatewayDetails.metadata.access_details = accessDetails // eslint-disable-line
                    props.setGatewayDetails(props.gatewayDetails)
                  }}
                  selectedValue={formik.values.publicallyAccessible}
                >
                  <Radio label="Yes" value="yes" />
                  <Radio label="No" value="no" />
                </RadioGroup>
                <Layout.Vertical spacing="xsmall">
                  <FormInput.Select
                    name="accessPoint"
                    label={'Select Access Point'}
                    placeholder={'Select Access Point'}
                    items={accessPointsList}
                    onChange={e => {
                      formik.setFieldValue('accessPoint', e.value)
                      props.gatewayDetails.accessPointID = e.value as string
                      props.gatewayDetails.hostName = generateHostName(e.label as string)
                      props.setGatewayDetails(props.gatewayDetails)
                      setGeneratedHostName(props.gatewayDetails.hostName)
                    }}
                    disabled={accessPointsLoading}
                  />
                  <Button minimal onClick={openModal} style={{ justifyContent: 'flex-start' }}>
                    <Text color={Color.BLUE_500}>+ Create a New Access point</Text>
                  </Button>
                </Layout.Vertical>
                {formik.values.customURL ? (
                  <>
                    <Layout.Horizontal spacing="small">
                      <Heading level={3} font={{ weight: 'light' }}>
                        Select the DNS Provider
                      </Heading>
                      <Icon name="info"></Icon>
                    </Layout.Horizontal>
                    <RadioGroup
                      inline={true}
                      label=""
                      name="dnsProvider"
                      onChange={e => {
                        formik.setFieldValue('dnsProvider', e.currentTarget.value)
                        setDNSProvider(e.currentTarget.value)
                        if (e.currentTarget.value == 'others') {
                          props.setHelpTextSections(['usingCustomDomain', 'dns-others'])
                        } else {
                          props.setHelpTextSections(['usingCustomDomain'])
                        }
                      }}
                      selectedValue={formik.values.dnsProvider}
                    >
                      <Radio label="Route53" value="route53" />
                      <Radio label="Others" value="others" />
                    </RadioGroup>
                    {formik.values.dnsProvider == 'route53' ? (
                      <>
                        <FormInput.Select
                          name="route53Account"
                          label={'Select Route53 account'}
                          placeholder={'Select Route53 account'}
                          items={hostedZonesList}
                          onChange={e => {
                            formik.setFieldValue('route53Account', e.value)
                            //eslint-disable-next-line
                            props.gatewayDetails.metadata.custom_domain_providers = {
                              route53: { hosted_zone_id: e.value as string } // eslint-disable-line
                            }
                            props.setGatewayDetails(props.gatewayDetails)
                          }}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            </Layout.Vertical>
          </FormikForm>
        )}
      ></Formik>
    </Layout.Vertical>
  )
}

export default DNSLinkSetup

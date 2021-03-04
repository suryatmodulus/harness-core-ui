import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  StepWizard,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  StepProps,
  SelectOption,
  Icon
} from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  AccessPoint,
  useAllCertificates,
  useAllHostedZones,
  useAllRegions,
  useAllSecurityGroups,
  useAllVPCs,
  useCreateAccessPoint,
  useGetAccessPoint
} from 'services/lw'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/exports'
import { Scope } from '@common/interfaces/SecretsInterface'

interface Props extends StepProps<any> {
  name: string
  accessPoint: AccessPoint
  closeModal: () => void
  refreshAccessPoints: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}
interface CreateAccessPointWizardProps {
  accessPoint: AccessPoint
  closeModal: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  refreshAccessPoints: () => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}

interface MapToProviderProps {
  accessPoint: AccessPoint
}
const MapToProvider: React.FC<StepProps<MapToProviderProps> & Props> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { data: hostedZones, loading: hostedZonesLoading, refetch: loadHostedZones } = useAllHostedZones({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.accessPoint.cloud_account_id as string, // eslint-disable-line
      region: 'us-east-1'
    },
    lazy: true
  })
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>('route53')

  const { showError, showSuccess } = useToaster()
  const { previousStep } = props
  const { getString } = useStrings()
  const [accessPointStatusInProgress, setaccessPointStatusInProgress] = useState<boolean>(false)
  const [accessPointID, setAccessPointID] = useState<string>()
  const { data: accessPointData, refetch, loading: accessPointStatusLoading } = useGetAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    access_point_id: props.accessPoint.id as string, //eslint-disable-line
    lazy: true
  })
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
    if (accessPointStatusInProgress && accessPointID) {
      if (!accessPointStatusLoading) {
        if (accessPointData?.response?.status == 'errored') {
          setaccessPointStatusInProgress(false)
          showError('could not create access point')
        } else if (accessPointData?.response?.status == 'created') {
          setaccessPointStatusInProgress(false)
          // props.setAccessPoint(accessPointData?.response as AccessPoint)
          showSuccess('Access Point Created Succesfully')
          props.refreshAccessPoints()
          props.setAccessPoint?.(accessPointData?.response)
          props.closeModal()
        } else {
          const timerId = window.setTimeout(() => {
            refetch()
          }, 1000)
          return () => {
            window.clearTimeout(timerId)
          }
        }
      }
    }
  }, [accessPointData, refetch, accessPointStatusLoading, accessPointID])

  const { mutate: createAccessPoint } = useCreateAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })

  const onSave = async (): Promise<void> => {
    setaccessPointStatusInProgress(true)
    try {
      const result = await createAccessPoint(props.accessPoint) // eslint-disable-line
      if (result.response) {
        props.accessPoint.id = result.response.id
        setAccessPointID(result.response.id)
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical style={{ minHeight: '640px', width: '55%' }} padding="large" spacing="large">
      <Heading level={2}>{props.name}</Heading>
      <Formik
        initialValues={{
          dnsProvider: props.accessPoint.metadata?.dns?.route53 ? 'route53' : 'others',
          route53Account: props.accessPoint.metadata?.dns?.route53?.hosted_zone_id // eslint-disable-line
        }}
        onSubmit={_ => {
          onSave()
        }}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" height="640px">
              <RadioGroup
                inline={true}
                name="dnsProvider"
                label={'Select the DNS Provider'}
                onChange={e => {
                  formik.setFieldValue('dnsProvider', e.currentTarget.value)
                  setDNSProvider(e.currentTarget.value)
                  if (props.accessPoint.metadata) {
                    if (e.currentTarget.value == 'route53') {
                      props.accessPoint.metadata.dns = {
                        route53: {
                          hosted_zone_id: '' // eslint-disable-line
                        }
                      }
                    } else {
                      props.accessPoint.metadata.dns = {
                        others: ''
                      }
                    }
                  }
                }}
                selectedValue={formik.values.dnsProvider}
              >
                <Radio label="Route53" value="route53" />
                <Radio label="Others" value="others" />
              </RadioGroup>
              {formik.values.dnsProvider == 'route53' ? (
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="route53Account"
                    label={'Select Route53 hosted zone'}
                    placeholder={'Select route 53 hosted zone'}
                    items={hostedZonesList}
                    onChange={e => {
                      formik.setFieldValue('route53Account', e.value)
                      if (props.accessPoint.metadata) {
                        props.accessPoint.metadata.dns = {
                          route53: {
                            hosted_zone_id: e.value as string // eslint-disable-line
                          }
                        }
                      }
                    }}
                    style={{ width: '80%' }}
                    disabled={hostedZonesLoading || hostedZonesList.length == 0}
                  />
                </Layout.Horizontal>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal spacing="medium" style={{ position: 'absolute', bottom: 0 }}>
              <Button
                text={getString('previous')}
                icon="chevron-left"
                onClick={_ =>
                  previousStep?.({
                    accessPoint: props.accessPoint
                  })
                }
                disabled={accessPointStatusInProgress}
              />

              <Button
                intent="primary"
                text={getString('ce.co.accessPoint.create')}
                onClick={formik.submitForm}
                disabled={accessPointStatusInProgress}
              ></Button>
              {accessPointStatusInProgress ? (
                <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
              ) : null}
            </Layout.Horizontal>
          </FormikForm>
        )}
        validationSchema={Yup.object().shape({
          route53Account: Yup.string().when(['dnsProvider'], {
            is: dns => dns == 'route53',
            then: Yup.string().required('Connector is a required field')
          })
        })}
      ></Formik>
    </Layout.Vertical>
  )
}
const CreateTunnelStep: React.FC<StepProps<any> & Props> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const [accessPoint, setAccessPoint] = useState<AccessPoint>(props.accessPoint)
  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([])
  const [vpcOptions, setvpcOptions] = useState<SelectOption[]>([])
  const [sgOptions, setSGOptions] = useState<SelectOption[]>([])
  const [certificateOptions, setCertificateOptions] = useState<SelectOption[]>([])
  const [selectedCloudAccount, setSelectedCloudAccount] = useState<string>(props.accessPoint.cloud_account_id as string)
  const [selectedRegion, setSelectedRegion] = useState<string>(props.accessPoint.region as string)
  const [selectedVpc, setSelectedVpc] = useState<string>(props.accessPoint.vpc as string)
  const { getString } = useStrings()
  const { nextStep } = props

  const { data: regions, loading: regionsLoading } = useAllRegions({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: selectedCloudAccount // eslint-disable-line
    }
  })
  const { data: vpcs, loading: vpcsLoading, refetch: vpcsReload } = useAllVPCs({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      region: selectedRegion,
      cloud_account_id: selectedCloudAccount // eslint-disable-line
    },
    lazy: true
  })
  const { data: certificates, loading: certificatesLoading, refetch: certificatesReload } = useAllCertificates({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      region: selectedRegion
    },
    lazy: true
  })
  const { data: securityGroups, loading: sgsLoading, refetch: sgsReload } = useAllSecurityGroups({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      region: selectedRegion,
      vpc_id: selectedVpc, // eslint-disable-line
      cloud_account_id: selectedCloudAccount // eslint-disable-line
    },
    lazy: true
  })
  useEffect(() => {
    if (regions?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      regions?.response?.map(r => {
        return {
          label: r.label as string,
          value: r.name as string
        }
      }) || []
    setRegionOptions(loaded)
  }, [regions])
  useEffect(() => {
    if (selectedRegion) {
      vpcsReload()
      certificatesReload()
    }
  }, [selectedRegion])
  useEffect(() => {
    if (selectedVpc) sgsReload()
  }, [selectedVpc])
  useEffect(() => {
    if (vpcs?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      vpcs?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setvpcOptions(loaded)
  }, [vpcs])
  useEffect(() => {
    if (securityGroups?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      securityGroups?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setSGOptions(loaded)
  }, [securityGroups])
  useEffect(() => {
    if (certificates?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      certificates?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setCertificateOptions(loaded)
  }, [certificates])
  return (
    <Layout.Vertical style={{ minHeight: '640px', width: '55%' }} padding="large" spacing="medium">
      <Heading level={2}>{props.name}</Heading>
      <Formik
        initialValues={{
          cloudConnector: {
            label: '',
            value: accessPoint.cloud_account_id // eslint-disable-line
          },
          accessPointName: accessPoint.host_name,
          accessPointRegion: accessPoint.region,
          vpc: accessPoint.vpc,
          securityGroups: accessPoint.metadata?.security_groups?.map(x => {
            return {
              value: x,
              label: x
            }
          }), // eslint-disable-line
          certificate: accessPoint.metadata?.certificate_id // eslint-disable-line
        }}
        onSubmit={_ => {
          nextStep?.({
            accessPoint: accessPoint
          })
        }}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" height="640px">
              {!props.isRuleCreationMode ? (
                <ConnectorReferenceField
                  name="cloudConnector"
                  placeholder={'Select Cloud Account'}
                  selected={accessPoint.cloud_account_id as ConnectorReferenceFieldProps['selected']} // eslint-disable-line
                  onChange={(record, scope) => {
                    props.accessPoint.cloud_account_id = record?.identifier // eslint-disable-line
                    setAccessPoint(props.accessPoint)
                    setSelectedCloudAccount(props.accessPoint.cloud_account_id as string) // eslint-disable-line
                    formik.setFieldValue('cloudConnector', {
                      label: record.name || '',
                      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${record.identifier}`,
                      scope: scope
                    })
                  }}
                  accountIdentifier={accountId}
                  label="Select Cloud Connector"
                  category={'CLOUD_COST'}
                  disabled={props.isEditMod}
                />
              ) : null}
              <FormInput.Text
                name="accessPointName"
                label={'Enter Access Point Domain name'}
                placeholder={'Access Point Domain name'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  props.accessPoint.host_name = e.target.value // eslint-disable-line
                  props.accessPoint.name = e.target.value // eslint-disable-line
                  setAccessPoint(props.accessPoint)
                  formik.setFieldValue('accessPointName', e.target.value)
                }}
                disabled={props.isEditMod}
              />
              {!props.isRuleCreationMode ? (
                <FormInput.Select
                  name="accessPointRegion"
                  label={'Select region to install Access Point'}
                  placeholder={'Select region'}
                  items={regionOptions}
                  onChange={e => {
                    props.accessPoint.region = e.value as string
                    setAccessPoint(props.accessPoint)
                    setSelectedRegion(props.accessPoint.region)
                    formik.setFieldValue('accessPointRegion', e.value)
                  }}
                  disabled={regionsLoading || regionOptions.length == 0 || props.isEditMod}
                />
              ) : null}
              <FormInput.Select
                name="certificate"
                label={'Select a certificate'}
                placeholder={'Select Certificate'}
                items={certificateOptions}
                onChange={e => {
                  formik.setFieldValue('certificate', e)
                  if (props.accessPoint.metadata) props.accessPoint.metadata.certificate_id = e.value as string // eslint-disable-line
                  setAccessPoint(props.accessPoint)
                }}
                disabled={certificatesLoading || certificateOptions.length == 0}
              />
              {!props.isRuleCreationMode ? (
                <FormInput.Select
                  name="vpc"
                  label={'Select VPC'}
                  placeholder={'Select VPC'}
                  items={vpcOptions}
                  onChange={e => {
                    formik.setFieldValue('vpc', e.value)
                    props.accessPoint.vpc = e.value as string
                    setAccessPoint(props.accessPoint)
                    setSelectedVpc(props.accessPoint.vpc)
                  }}
                  disabled={vpcsLoading || vpcOptions.length == 0 || props.isEditMod}
                />
              ) : null}
              <FormInput.MultiSelect
                name="securityGroups"
                label={'Select Security groups'}
                placeholder={'Select Security groups'}
                items={sgOptions}
                onChange={e => {
                  formik.setFieldValue('securityGroups', e)
                  // eslint-disable-next-line
                  if (props.accessPoint.metadata) {
                    // eslint-disable-next-line
                    props.accessPoint.metadata.security_groups = e.map(x => {
                      return x.value as string
                    })
                    setAccessPoint(props.accessPoint)
                  }
                }}
                disabled={sgsLoading || sgOptions.length == 0}
              />
              <Button
                intent="primary"
                text={getString('ce.co.accessPoint.proceed')}
                onClick={formik.submitForm}
                style={{ position: 'absolute', bottom: 0 }}
              ></Button>
            </Layout.Vertical>
          </FormikForm>
        )}
        validationSchema={Yup.object().shape({
          cloudConnector: Yup.string().required('Connector is a required field'),
          accessPointName: Yup.string().required('Access point Name is a required field'),
          accessPointRegion: Yup.string().required('Region is a required field'),
          vpc: Yup.string().required('VPC is a required field'),
          subnets: Yup.array(Yup.string()).min(2, 'Atleast 2 subnets are mandatory'),
          securityGroups: Yup.array(Yup.string()).min(1, 'Atleast one security group is mandatory')
        })}
      ></Formik>
    </Layout.Vertical>
  )
}
const CreateAccessPointWizard: React.FC<CreateAccessPointWizardProps> = props => {
  return (
    <StepWizard icon={'service-aws'} iconProps={{ size: 40 }} title={'Create New Access Point'}>
      <CreateTunnelStep
        name="Create access point"
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        refreshAccessPoints={props.refreshAccessPoints}
        isEditMod={props.isEditMod}
        isRuleCreationMode={props.isRuleCreationMode}
      />
      <MapToProvider
        name="Map the domain"
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        setAccessPoint={props.setAccessPoint}
        refreshAccessPoints={props.refreshAccessPoints}
      />
    </StepWizard>
  )
}

export default CreateAccessPointWizard

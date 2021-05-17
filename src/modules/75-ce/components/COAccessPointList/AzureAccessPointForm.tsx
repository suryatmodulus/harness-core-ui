import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Button, Container, Formik, FormikForm, FormInput, Icon, Layout, SelectOption } from '@wings-software/uicore'
import {
  AccessPoint,
  useAllRegions,
  useAllResourceGroups,
  useAllVPCs,
  useAllSubnets,
  useAllPublicIps,
  useAllCertificates
} from 'services/lw'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

export interface AzureApFormVal {
  ip: string
  region: string
  resourceGroup: string
  sku: string
  subnet: string
  virtualNetwork: string
  certificate: string
}

interface AzureAccessPointFormProps {
  onSave: (savedAp: AccessPoint) => void
  cloudAccountId: string
  handlePreviousClick: () => void
  lbCreationInProgress: boolean
  handleFormSubmit: (val: AzureApFormVal) => void
  loadBalancer: AccessPoint
}

const SKUItems: SelectOption[] = [
  { label: 'SKU 1, Small', value: 'sku1_small' },
  { label: 'SKU 1, Medium', value: 'sku1_medium' },
  { label: 'SKU 1, Large', value: 'sku1_large' },
  { label: 'SKU2', value: 'sku2' }
]

const AzureAccessPointForm: React.FC<AzureAccessPointFormProps> = props => {
  const { cloudAccountId, lbCreationInProgress, loadBalancer } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const [regionsOptions, setRegionsOptions] = useState<SelectOption[]>([])
  const [resourceGroupsOptions, setResourceGroupsOptions] = useState<SelectOption[]>([])
  const [vpcOptions, setVpcOptions] = useState<SelectOption[]>([])
  const [subnetsOptions, setSubnetsOptions] = useState<SelectOption[]>([])
  const [publicIpsOptions, setPublicIpsOptions] = useState<SelectOption[]>([])
  const [certificatesOptions, setCertificatesOptions] = useState<SelectOption[]>([])
  const [selectedRegion, setSelectedRegion] = useState<SelectOption>()
  const [selectedVpc, setSelectedVpc] = useState<SelectOption>()
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<SelectOption>()

  const { data: regions, loading: regionsLoading } = useAllRegions({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId // eslint-disable-line
    }
  })

  const { data: resourceGroups, loading: resourceGroupsLoading } = useAllResourceGroups({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId // eslint-disable-line
    }
  })

  const { data: vpcs, loading: vpcsLoading, refetch: vpcsReload } = useAllVPCs({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: selectedRegion?.value as string,
      resource_group_name: selectedResourceGroup?.value as string
    },
    lazy: true
  })

  const { data: subnets, loading: subnetsLoading, refetch: subnetsReload } = useAllSubnets({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: selectedRegion?.value as string,
      vpc: selectedVpc?.label as string,
      resource_group_name: selectedResourceGroup?.value as string
    },
    lazy: true
  })

  const { data: publicIps, loading: publicIpsLoading, refetch: publicIpsReload } = useAllPublicIps({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: selectedRegion?.value as string,
      vpc: selectedVpc?.label as string,
      resource_group_name: selectedResourceGroup?.value as string
    },
    lazy: true
  })

  const { data: certificates, loading: certificatesLoading, refetch: certificatesReload } = useAllCertificates({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: selectedRegion?.value as string,
      resource_group_name: selectedResourceGroup?.value as string
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
    setRegionsOptions(loaded)
  }, [regions])

  useEffect(() => {
    if (resourceGroups?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      resourceGroups?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.name as string
        }
      }) || []
    setResourceGroupsOptions(loaded)
  }, [resourceGroups])

  useEffect(() => {
    if (selectedRegion?.value && selectedResourceGroup?.value) {
      vpcsReload()
      certificatesReload()
    }
  }, [selectedRegion, selectedResourceGroup])

  useEffect(() => {
    if (vpcs?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      vpcs?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setVpcOptions(loaded)
  }, [vpcs])

  useEffect(() => {
    if (subnets?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      subnets?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setSubnetsOptions(loaded)
  }, [subnets])

  useEffect(() => {
    if (publicIps?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      publicIps?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setPublicIpsOptions(loaded)
  }, [publicIps])

  useEffect(() => {
    if (certificates?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      certificates?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setCertificatesOptions(loaded)
  }, [certificates])

  return (
    <Container>
      <Formik
        initialValues={{
          ip: loadBalancer.metadata?.fe_ip_id || '',
          region: loadBalancer.region || '',
          resourceGroup: loadBalancer.metadata?.resource_group || '',
          sku: loadBalancer.metadata?.size || '',
          subnet: loadBalancer.metadata?.subnet_id || '',
          virtualNetwork: loadBalancer.vpc || '',
          certificate: loadBalancer.metadata?.certificate_id || ''
        }}
        onSubmit={props.handleFormSubmit}
      >
        {({ submitForm }) => (
          <FormikForm>
            <Layout.Horizontal className={css.formFieldRow}>
              <FormInput.Select
                label={'Region'}
                placeholder={'Select region'}
                name="region"
                items={regionsOptions}
                onChange={regionItem => {
                  setSelectedRegion(regionItem)
                }}
                disabled={regionsLoading}
              />
              <FormInput.Select
                label={'Resource Group'}
                placeholder={'Select resource group'}
                name="resourceGroup"
                items={resourceGroupsOptions}
                disabled={resourceGroupsLoading}
                onChange={resourceItem => {
                  setSelectedResourceGroup(resourceItem)
                }}
              />
            </Layout.Horizontal>
            <Layout.Horizontal className={css.formFieldRow}>
              <FormInput.Select
                label={'Certificate'}
                placeholder={'Select certificate'}
                name={'certificate'}
                items={certificatesOptions}
                disabled={certificatesLoading || !selectedRegion || !selectedResourceGroup}
              />
              <FormInput.Select
                label={'Virtual Network'}
                placeholder={'Select virtual network'}
                name="virtualNetwork"
                items={vpcOptions}
                disabled={vpcsLoading || !selectedRegion}
                onChange={vpcItem => {
                  setSelectedVpc(vpcItem)
                  subnetsReload({
                    queryParams: {
                      cloud_account_id: cloudAccountId,
                      region: selectedRegion?.value as string,
                      vpc: vpcItem.label as string,
                      resource_group_name: selectedResourceGroup?.value as string
                    }
                  })
                  publicIpsReload({
                    queryParams: {
                      cloud_account_id: cloudAccountId,
                      region: selectedRegion?.value as string,
                      vpc: vpcItem.label as string,
                      resource_group_name: selectedResourceGroup?.value as string
                    }
                  })
                }}
              />
            </Layout.Horizontal>
            <Layout.Horizontal className={css.formFieldRow}>
              <FormInput.Select
                label={'Subnet'}
                placeholder={'Select subnet'}
                name="subnet"
                items={subnetsOptions}
                disabled={subnetsLoading || !selectedVpc}
              />
              <FormInput.Select
                label={'Frontend IP'}
                placeholder={'Select IP'}
                name="ip"
                items={publicIpsOptions}
                disabled={publicIpsLoading || !selectedRegion || !selectedVpc || !selectedResourceGroup}
              />
            </Layout.Horizontal>
            <Layout.Horizontal className={css.formFieldRow}>
              <FormInput.Select label={'SKU'} placeholder={'Select SKU'} name="sku" items={SKUItems} />
            </Layout.Horizontal>
            <Layout.Horizontal style={{ marginTop: 100 }}>
              <Button minimal icon={'chevron-left'} onClick={props.handlePreviousClick}>
                Back
              </Button>
              {!lbCreationInProgress && (
                <Button intent={'primary'} onClick={submitForm}>
                  Save
                </Button>
              )}
              {lbCreationInProgress && (
                <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
              )}
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default AzureAccessPointForm

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Heading } from '@wings-software/uicore'
import { AccessPoint, useCreateAccessPoint, useGetAccessPoint } from 'services/lw'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import AzureAccessPointForm, { AzureApFormVal } from './AzureAccessPointForm'
import AzureApDnsMapping, { AzureDnsFormVal } from './AzureDnsMapping'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

interface AzureAPConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: () => void
  onSave: (savedLoadBalancer: AccessPoint) => void
  createMode?: boolean
}

enum FormStep {
  FIRST = 1,
  SECOND = 2
}

const AzureAPConfig: React.FC<AzureAPConfigProps> = props => {
  const { loadBalancer, cloudAccountId, createMode = false, onSave } = props
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const lastStep = useRef(FormStep.SECOND)
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.FIRST)
  const [newAp, setNewAp] = useState<AccessPoint>(loadBalancer)
  const [loadBalancerId, setLoadBalancerId] = useState<string>()
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { data: accessPointData, refetch, loading: accessPointStatusLoading } = useGetAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    access_point_id: loadBalancerId as string, //eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { mutate: createLoadBalancer } = useCreateAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })

  const moveForward = () => {
    if (currentStep === lastStep.current) return
    setCurrentStep(currentStep + 1)
  }

  const moveBackward = () => {
    if (currentStep === FormStep.FIRST) return
    setCurrentStep(currentStep - 1)
  }

  const handleDnsMappingSubmission = (_values: AzureDnsFormVal) => {
    const updatedAp = { ...newAp }
    updatedAp.host_name = _values.customDomain
    updatedAp.name = _values.name
    setNewAp(updatedAp)
    moveForward()
  }

  useEffect(() => {
    if (lbCreationInProgress && loadBalancerId) {
      if (!accessPointStatusLoading) {
        if (accessPointData?.response?.status == 'errored') {
          setLbCreationInProgress(false)
          showError(getString('ce.co.accessPoint.error') + '\n' + accessPointData.response.metadata?.error)
        } else if (accessPointData?.response?.status == 'created') {
          setLbCreationInProgress(false)
          // props.setAccessPoint(accessPointData?.response as AccessPoint)
          showSuccess(getString('ce.co.accessPoint.success'))
          props.onSave?.(accessPointData.response)
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
  }, [accessPointData, refetch, accessPointStatusLoading, loadBalancerId])

  const saveLb = async (lbToSave: AccessPoint): Promise<void> => {
    setLbCreationInProgress(true)
    try {
      const result = await createLoadBalancer(lbToSave) // eslint-disable-line
      if (result.response) {
        setLoadBalancerId(result.response.id as string)
      }
    } catch (e) {
      setLbCreationInProgress(false)
      showError(e.data?.errors?.join('\n') || e.data?.message || e.message)
    }
  }

  const handleFormSubmit = (val: AzureApFormVal) => {
    saveLb({
      ...newAp,
      org_id: orgIdentifier,
      project_id: projectIdentifier,
      cloud_account_id: props.cloudAccountId,
      region: val.region,
      subnets: [val.subnet],
      vpc: val.virtualNetwork,
      metadata: {
        resource_group: val.resourceGroup,
        fe_ip_id: val.ip,
        size: val.sku,
        subnet_id: val.subnet,
        certificate_id: val.certificate
      }
    })
  }

  const handleBackClick = (values: AzureApFormVal) => {
    setNewAp(prevAp => ({
      ...prevAp,
      region: values.region,
      ...(values.subnet && {
        subnets: [values.subnet]
      }),
      vpc: values.virtualNetwork,
      metadata: {
        ...prevAp.metadata,
        resource_group: values.resourceGroup,
        fe_ip_id: values.ip,
        size: values.sku,
        subnet_id: values.subnet,
        certificate_id: values.certificate
      }
    }))
    moveBackward()
  }
  return (
    <div className={css.loadBalancerDnsConfigDialog}>
      <Heading level={2} className={css.configHeading}>
        {createMode
          ? 'Create a new Application Gateway'
          : `The Application gateway ${loadBalancer?.id || ''} requires additional Configuration`}
      </Heading>
      <div>
        {currentStep === FormStep.FIRST && (
          <AzureApDnsMapping createMode={createMode} handleSubmit={handleDnsMappingSubmission} loadBalancer={newAp} />
        )}
        {currentStep === FormStep.SECOND && (
          <AzureAccessPointForm
            cloudAccountId={cloudAccountId as string}
            onSave={onSave}
            handlePreviousClick={handleBackClick}
            lbCreationInProgress={lbCreationInProgress}
            handleFormSubmit={handleFormSubmit}
            loadBalancer={newAp}
          />
        )}
      </div>
    </div>
  )
}

export default AzureAPConfig

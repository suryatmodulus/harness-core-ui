import React, { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Heading } from '@wings-software/uicore'
import { AccessPoint, useCreateAccessPoint } from 'services/lw'
// import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import AzureAccessPointForm, { AzureApFormVal } from './AzureAccessPointForm'
import AzureApDnsMapping, { AzureDnsFormVal } from './AzureDnsMapping'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

interface AzureAPConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: (clearSelection?: boolean) => void
  onSave: (savedLoadBalancer: AccessPoint) => void
  createMode?: boolean
}

enum FormStep {
  FIRST = 1,
  SECOND = 2
}

const AzureAPConfig: React.FC<AzureAPConfigProps> = props => {
  const { loadBalancer, cloudAccountId, createMode = false, onSave } = props
  // const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const lastStep = useRef(FormStep.SECOND)
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.FIRST)
  const [newAp, setNewAp] = useState<AccessPoint>(loadBalancer)
  // const [loadBalancerId, setLoadBalancerId] = useState<string>()
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  /*Remove commented code after PR is done*/
  // const { data: accessPointData, refetch, loading: accessPointStatusLoading } = useGetAccessPoint({
  //   org_id: orgIdentifier, // eslint-disable-line
  //   project_id: projectIdentifier, // eslint-disable-line
  //   access_point_id: loadBalancerId as string, //eslint-disable-line
  //   queryParams: {
  //     accountIdentifier: accountId
  //   },
  //   lazy: true
  // })

  const { mutate: createLoadBalancer } = useCreateAccessPoint({
    account_id: accountId
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

  // useEffect(() => {
  //   if (lbCreationInProgress && loadBalancerId) {
  //     if (!accessPointStatusLoading) {
  //       if (accessPointData?.response?.status == 'errored') {
  //         setLbCreationInProgress(false)
  //         showError(
  //           getString('ce.co.accessPoint.error') + '\n' + accessPointData.response.metadata?.error,
  //           undefined,
  //           'ce.ap.data.error'
  //         )
  //       } else if (accessPointData?.response?.status == 'created') {
  //         setLbCreationInProgress(false)
  //         // props.setAccessPoint(accessPointData?.response as AccessPoint)
  //         showSuccess(getString('ce.co.accessPoint.success'))
  //         props.onSave?.(accessPointData.response)
  //         props.onClose?.()
  //       } else {
  //         const timerId = window.setTimeout(() => {
  //           refetch()
  //         }, 1000)
  //         return () => {
  //           window.clearTimeout(timerId)
  //         }
  //       }
  //     }
  //   }
  // }, [accessPointData, refetch, accessPointStatusLoading, loadBalancerId])

  const saveLb = async (lbToSave: AccessPoint): Promise<void> => {
    setLbCreationInProgress(true)
    try {
      const result = await createLoadBalancer(lbToSave) // eslint-disable-line
      if (result.response) {
        // setLoadBalancerId(result.response.id as string)
        showSuccess('Load Balancer creation request is submitted and will be created in some time.')
        props.onSave?.(result.response)
        props.onClose?.()
      }
    } catch (e) {
      setLbCreationInProgress(false)
      showError(e.data?.errors?.join('\n') || e.data?.message || e.message, undefined, 'ce.savelb.error')
    }
  }

  const handleFormSubmit = (val: AzureApFormVal) => {
    saveLb({
      ...newAp,
      org_id: orgIdentifier,
      project_id: projectIdentifier,
      cloud_account_id: props.cloudAccountId,
      region: val.region,
      subnets: val.subnet ? [val.subnet] : [],
      vpc: val.virtualNetwork,
      metadata: {
        ...newAp.metadata,
        resource_group: val.resourceGroup,
        fe_ip_id: val.ip,
        size: val.sku,
        subnet_id: val.subnet,
        ...(val.newCertificate ? { certificate: val.newCertificate } : { certificate_id: val.certificate }),
        subnet_name: val.subnet_name,
        fe_ip_name: val.fe_ip_name,
        func_region: val.func_region
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
        ...(values.newCertificate ? { certificate: values.newCertificate } : { certificate_id: values.certificate }),
        subnet_name: values.subnet_name,
        fe_ip_name: values.fe_ip_name,
        func_region: values.func_region
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
          <AzureApDnsMapping
            createMode={createMode}
            handleSubmit={handleDnsMappingSubmission}
            loadBalancer={newAp}
            handleCancel={() => props.onClose?.(true)}
          />
        )}
        {currentStep === FormStep.SECOND && (
          <AzureAccessPointForm
            cloudAccountId={cloudAccountId as string}
            onSave={onSave}
            handlePreviousClick={handleBackClick}
            lbCreationInProgress={lbCreationInProgress}
            handleFormSubmit={handleFormSubmit}
            loadBalancer={newAp}
            isCreateMode={createMode}
          />
        )}
      </div>
    </div>
  )
}

export default AzureAPConfig

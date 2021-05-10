import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Heading } from '@wings-software/uicore'
import { AccessPoint, useCreateAccessPoint, useGetAccessPoint } from 'services/lw'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import LBFormStepFirst, { FormVal } from './LBFormStepFirst'
import LBFormStepSecond, { FormValue } from './LBFormStepSecond'
import css from './COGatewayAccess.module.scss'

interface LoadBalancerDnsConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: () => void
  onSave?: (savedLoadBalancer: AccessPoint) => void
  createMode?: boolean
}

enum FormStep {
  FIRST = 1,
  SECOND = 2
}

const LoadBalancerDnsConfig: React.FC<LoadBalancerDnsConfigProps> = props => {
  const { loadBalancer, cloudAccountId, onClose, createMode = false, onSave } = props
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const lastStep = useRef(FormStep.SECOND)
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.FIRST)
  const [newLoadBalancer, setNewLoadBalancer] = useState<AccessPoint>(loadBalancer)
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)
  const [loadBalancerId, setLoadBalancerId] = useState<string>()
  const [currCloudAccountId, setCurrCloudAccountId] = useState<string | undefined>(cloudAccountId)

  const { orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const { mutate: createLoadBalancer } = useCreateAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })

  const { data: accessPointData, refetch, loading: accessPointStatusLoading } = useGetAccessPoint({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    access_point_id: loadBalancerId as string, //eslint-disable-line
    lazy: true
  })

  const moveForward = () => {
    if (currentStep === lastStep.current) return
    setCurrentStep(currentStep + 1)
  }

  const moveBackward = () => {
    if (currentStep === FormStep.FIRST) return
    setCurrentStep(currentStep - 1)
  }

  const handleFirstScreenSubmit = (values: FormVal) => {
    const updatedLb = { ...newLoadBalancer }
    if (!updatedLb.cloud_account_id) {
      updatedLb.cloud_account_id = currCloudAccountId // eslint-disable-line
    }
    if (values.lbName) {
      updatedLb.name = values.lbName
      updatedLb.host_name = values.customDomainPrefix // eslint-disable-line
    }
    updatedLb.metadata = {
      ...updatedLb.metadata,
      dns: {
        ...(values.dnsProvider === 'route53'
          ? { route53: { hosted_zone_id: values.hostedZoneId as string } } // eslint-disable-line
          : { others: values.customDomainPrefix })
      }
    }
    setNewLoadBalancer(updatedLb)
    // if (!createMode) {
    //   saveLb(updatedLb)
    // } else {
    // }
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
          onSave?.(accessPointData.response)
          onClose?.()
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

  const saveLb = async (lbToSave?: AccessPoint): Promise<void> => {
    setLbCreationInProgress(true)
    try {
      const result = await createLoadBalancer(lbToSave || newLoadBalancer) // eslint-disable-line
      if (result.response) {
        setLoadBalancerId(result.response.id as string)
      }
    } catch (e) {
      showError(e.data?.errors?.join('\n') || e.data?.message || e.message)
      setLbCreationInProgress(false)
    }
  }

  const handleSecondFormSubmission = (_val: FormValue) => {
    // console.log(_val)
    const updatedLb = {
      ...newLoadBalancer,
      ...(_val.accessPointRegion && { region: _val.accessPointRegion }),
      ...(_val.vpc && { vpc: _val.vpc }),
      metadata: {
        ...newLoadBalancer.metadata,
        ...(_val.securityGroups && { security_groups: _val.securityGroups.map(_i => _i.value) as string[] }), // eslint-disable-line
        ...(_val.certificate && { certificate_id: _val.certificate.value as string }) // eslint-disable-line
      }
    }
    setNewLoadBalancer(updatedLb)
    // console.log(newLoadBalancer)
    saveLb()
  }

  return (
    <div className={css.loadBalancerDnsConfigDialog}>
      <Heading level={2} className={css.configHeading}>
        {createMode
          ? 'Create a new Application Load Balancer'
          : `The Load Balancer ${loadBalancer?.id || ''} requires additional Configuration`}
      </Heading>
      <div>
        {currentStep === FormStep.FIRST && (
          <LBFormStepFirst
            cloudAccountId={currCloudAccountId}
            handleCancel={onClose}
            createMode={createMode}
            handleSubmit={handleFirstScreenSubmit}
            loadBalancer={newLoadBalancer}
            handleCloudConnectorChange={setCurrCloudAccountId}
            isSaving={lbCreationInProgress}
          />
        )}
        {currentStep === FormStep.SECOND && (
          <LBFormStepSecond
            cloudAccountId={currCloudAccountId as string}
            loadBalancer={newLoadBalancer}
            setNewLoadBalancer={setNewLoadBalancer}
            handleSubmit={handleSecondFormSubmission}
            handlePreviousClick={moveBackward}
            isSaving={lbCreationInProgress}
          />
        )}
      </div>
    </div>
  )
}

export default LoadBalancerDnsConfig

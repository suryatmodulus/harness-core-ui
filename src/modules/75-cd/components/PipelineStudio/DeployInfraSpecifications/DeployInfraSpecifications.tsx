import React, { useEffect, useState } from 'react'
import YAML from 'yaml'
import { Layout, Card, Icon, Text, Accordion, Button } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'
import { debounce, get, isEmpty, isNil, omit } from 'lodash-es'
import cx from 'classnames'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  ExecutionWrapper,
  getProvisionerExecutionStrategyYamlPromise,
  K8SDirectInfrastructure,
  K8sGcpInfrastructure,
  NgPipeline,
  PipelineInfrastructure,
  StageElementWrapper
} from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { InfraProvisioningData } from '@cd/components/PipelineSteps/InfraProvisioning/InfraProvisioning'
import type { GcpInfrastructureSpec } from '@cd/components/PipelineSteps/GcpInfrastructureSpec/GcpInfrastructureSpec'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { String, useStrings } from 'framework/strings'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import css from './DeployInfraSpecifications.module.scss'

interface DeploymentTypeItem {
  name: string
  icon: IconName
  type: string
  enabled: boolean
}

interface DeploymentTypeGroup {
  name: string
  items: DeploymentTypeItem[]
}

export default function DeployInfraSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const isProvisionerEnabled = useFeatureFlag('NG_PROVISIONERS')
  const [initialInfrastructureDefinitionValues, setInitialInfrastructureDefinitionValues] = React.useState<
    K8SDirectInfrastructure | K8sGcpInfrastructure
  >({})
  const [selectedDeploymentType, setSelectedDeploymentType] = React.useState<string | undefined>()
  const [updateKey, setUpdateKey] = React.useState(0)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { getString } = useStrings()
  const deploymentTypes: DeploymentTypeGroup[] = [
    {
      name: getString('pipelineSteps.deploy.infrastructure.directConnection'),
      items: [
        {
          name: getString('pipelineSteps.deploymentTypes.kubernetes'),
          icon: 'service-kubernetes',
          type: 'KubernetesDirect',
          enabled: true
        }
      ]
    },
    {
      name: getString('pipelineSteps.deploy.infrastructure.viaCloudProvider'),
      items: [
        {
          name: getString('pipelineSteps.deploymentTypes.gk8engine'),
          icon: 'google-kubernetes-engine',
          type: 'KubernetesGcp',
          enabled: true
        }
      ]
    }
  ]

  const {
    state: {
      pipeline,
      originalPipeline,
      selectionState: { selectedStageId }
    },
    isReadonly,
    updatePipeline,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const debounceUpdatePipeline = React.useRef(
    debounce((pipelineData: NgPipeline) => {
      return updatePipeline(pipelineData)
    }, 500)
  ).current

  const { stage } = getStageFromPipeline(selectedStageId || '')

  const resetInfrastructureDefinition = (type?: string, shouldUpdate = false) => {
    const spec = get(stage, 'stage.spec', {})
    spec.infrastructure = {
      ...spec.infrastructure,
      infrastructureDefinition: {}
    }

    if (type) {
      spec.infrastructure.infrastructureDefinition.type = type
    }

    if (shouldUpdate) {
      const initialInfraDefValues = getInfrastructureDefaultValue(stage, type)
      setInitialInfrastructureDefinitionValues(initialInfraDefValues)

      updatePipeline(pipeline)
    }

    setProvisionerEnabled(false)
  }

  const infraSpec = get(stage, 'stage.spec.infrastructure', null)
  if (isNil(infraSpec)) {
    const spec = get(stage, 'stage.spec', {})
    spec['infrastructure'] = {
      environmentRef: '',
      infrastructureDefinition: {},
      allowSimultaneousDeployments: false,
      infrastructureKey: ''
    }
  }

  React.useEffect(() => {
    const type = stage?.stage?.spec?.infrastructure?.infrastructureDefinition?.type
    setSelectedDeploymentType(type)
    const initialInfraDefValues = getInfrastructureDefaultValue(stage, type)
    setInitialInfrastructureDefinitionValues(initialInfraDefValues)
    setUpdateKey(Math.random())
  }, [stage])

  const onUpdateInfrastructureDefinition = (
    extendedSpec: K8SDirectInfrastructure | K8sGcpInfrastructure,
    type: string
  ): void => {
    const infrastructure = get(stage, 'stage.spec.infrastructure', null)
    if (infrastructure) {
      infrastructure.infrastructureDefinition = {
        ...infrastructure.infrastructureDefinition,
        type,
        spec: omit(extendedSpec, 'allowSimultaneousDeployments', 'infrastructureKey')
      }
      infrastructure.allowSimultaneousDeployments = extendedSpec.allowSimultaneousDeployments || false
      infrastructure.infrastructureKey = extendedSpec.infrastructureKey || ''
      debounceUpdatePipeline(pipeline)
    }
  }

  const filterSelectedDeploymentType = (
    deploymentTypeGroups: DeploymentTypeGroup[],
    selDeploymentType: string
  ): DeploymentTypeGroup[] => {
    const groups = deploymentTypeGroups.filter(group => group?.items?.find(type => type.type === selDeploymentType))
    if (groups[0]) {
      groups[0].items = groups[0].items.filter(type => type.type === selDeploymentType)
      return groups
    }

    return deploymentTypeGroups
  }

  const renderInfraSelection = (): JSX.Element => {
    const visibleDeploymentTypes = selectedDeploymentType
      ? filterSelectedDeploymentType(deploymentTypes, selectedDeploymentType)
      : deploymentTypes

    return (
      <>
        <div className={css.deploymentTypeGroups}>
          {visibleDeploymentTypes.map(deploymentTypeGroup => {
            return (
              <div className={css.deploymentTypeGroup} key={deploymentTypeGroup.name}>
                <div className={css.connectionType}>{deploymentTypeGroup.name}</div>
                <Layout.Horizontal>
                  {deploymentTypeGroup.items.map(deploymentType => (
                    <>
                      <div key={deploymentType.name} className={css.squareCardContainer}>
                        <Card
                          disabled={!deploymentType.enabled || isReadonly}
                          interactive={true}
                          selected={deploymentType.type === selectedDeploymentType}
                          onClick={() => {
                            if (selectedDeploymentType !== deploymentType.type) {
                              setSelectedDeploymentType(deploymentType.type)
                              resetInfrastructureDefinition(deploymentType.type, true)
                            }
                          }}
                          cornerSelected={deploymentType.type === selectedDeploymentType}
                          className={cx({ [css.disabled]: !deploymentType.enabled }, css.squareCard)}
                        >
                          <Icon name={deploymentType.icon as IconName} size={26} height={26} />
                        </Card>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: deploymentType.enabled ? 'var(--grey-900)' : 'var(--grey-350)',
                            textAlign: 'center'
                          }}
                        >
                          {deploymentType.name}
                        </Text>
                      </div>
                    </>
                  ))}
                </Layout.Horizontal>
              </div>
            )
          })}
          {selectedDeploymentType ? (
            <Button
              className={css.changeButton}
              disabled={isReadonly}
              minimal
              intent="primary"
              onClick={() => {
                setSelectedDeploymentType(undefined)
                resetInfrastructureDefinition(undefined, true)
              }}
              text={getString('change')}
            />
          ) : null}
        </div>
      </>
    )
  }

  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(false)
  const [provisionerSnippetLoading, setProvisionerSnippetLoading] = useState<boolean>(false)

  const isProvisionerEmpty = (stageData: StageElementWrapper) => {
    const provisionerData = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    return isEmpty(provisionerData?.steps) && isEmpty(provisionerData?.rollbackSteps)
  }

  // load and apply provisioner snippet to the stage
  useEffect(() => {
    if (stage && isProvisionerEmpty(stage) && provisionerEnabled) {
      setProvisionerSnippetLoading(true)
      getProvisionerExecutionStrategyYamlPromise({ queryParams: { provisionerType: 'TERRAFORM' } }).then(res => {
        const provisionerSnippet = YAML.parse(res?.data || '')
        if (stage && isProvisionerEmpty(stage) && provisionerSnippet) {
          stage.stage.spec.infrastructure.infrastructureDefinition.provisioner = provisionerSnippet.provisioner
          updatePipeline(pipeline).then(() => {
            setProvisionerSnippetLoading(false)
          })
        }
      })
    }
  }, [provisionerEnabled])

  const cleanUpEmptyProvisioner = () => {
    const provisioner = stage?.stage.spec.infrastructure.infrastructureDefinition.provisioner
    let isChanged = false

    if (!isNil(provisioner?.steps) && provisioner?.steps.length === 0) {
      delete provisioner.steps
      isChanged = true
    }
    if (!isNil(provisioner?.rollbackSteps) && provisioner?.rollbackSteps.length === 0) {
      delete provisioner.rollbackSteps
      isChanged = true
    }

    if (!provisioner?.steps && !provisioner?.rollbackSteps) {
      delete stage?.stage.spec.infrastructure.infrastructureDefinition.provisioner
      isChanged = true
    }

    return isChanged
  }

  useEffect(() => {
    setProvisionerEnabled(!isProvisionerEmpty(stage || {}))

    return () => {
      const isChanged = cleanUpEmptyProvisioner()

      if (isChanged) {
        updatePipeline(pipeline)
      }
    }
  }, [])

  const getProvisionerData = (stageData: ExecutionWrapper): InfraProvisioningData => {
    let provisioner = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    let originalProvisioner: InfraProvisioningData['originalProvisioner'] = undefined
    if (selectedStageId) {
      const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
      originalProvisioner = get(originalStage, 'stage.spec.infrastructure.infrastructureDefinition.provisioner')
    }
    if (isNil(provisioner)) {
      provisioner = {}
    }
    if (isNil(provisioner.steps)) {
      provisioner.steps = []
    }
    if (isNil(provisioner.rollbackSteps)) {
      provisioner.rollbackSteps = []
    }

    return { provisioner, provisionerEnabled, provisionerSnippetLoading, originalProvisioner }
  }

  const getInfrastructureDefaultValue = (
    stageData: StageElementWrapper | undefined,
    deploymentType: string | undefined
  ): K8SDirectInfrastructure | K8sGcpInfrastructure => {
    const infrastructure = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition', null)
    const type = infrastructure?.type || deploymentType
    const allowSimultaneousDeployments = get(stageData, 'stage.spec.infrastructure.allowSimultaneousDeployments', false)
    const infrastructureKey = get(stageData, 'stage.spec.infrastructure.infrastructureKey', false)
    switch (type) {
      case 'KubernetesDirect': {
        const connectorRef = infrastructure?.spec?.connectorRef
        const namespace = infrastructure?.spec?.namespace
        const releaseName = infrastructure?.spec?.releaseName
        return {
          connectorRef,
          namespace,
          releaseName,
          allowSimultaneousDeployments,
          infrastructureKey
        }
      }
      case 'KubernetesGcp': {
        const connectorRef = infrastructure?.spec?.connectorRef
        const namespace = infrastructure?.spec?.namespace
        const releaseName = infrastructure?.spec?.releaseName
        const cluster = infrastructure?.spec?.cluster

        return {
          connectorRef,
          namespace,
          releaseName,
          cluster,
          allowSimultaneousDeployments,
          infrastructureKey
        }
      }
      default: {
        return {}
      }
    }
  }

  const getClusterConfigurationStep = (type: string) => {
    switch (type) {
      case 'KubernetesDirect': {
        return (
          <StepWidget<K8SDirectInfrastructure>
            factory={factory}
            key={updateKey}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues}
            type={StepType.KubernetesDirect}
            stepViewType={StepViewType.Edit}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  infrastructureKey: value.infrastructureKey
                },
                'KubernetesDirect'
              )
            }
          />
        )
      }
      case 'KubernetesGcp': {
        return (
          <StepWidget<GcpInfrastructureSpec>
            factory={factory}
            key={updateKey}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as GcpInfrastructureSpec}
            type={StepType.KubernetesGcp}
            stepViewType={StepViewType.Edit}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  cluster: value.cluster,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                  infrastructureKey: value.infrastructureKey
                },
                'KubernetesGcp'
              )
            }
          />
        )
      }
      default: {
        return <div>Undefined deployment type</div>
      }
    }
  }
  return (
    <div className={css.serviceOverrides}>
      <div className={css.contentSection} ref={scrollRef}>
        <Layout.Vertical>
          <div className={css.tabHeading} id="environment">
            {<String stringID="environment" />}
          </div>
          <Card className={cx(css.sectionCard)}>
            <StepWidget
              type={StepType.DeployEnvironment}
              readonly={isReadonly}
              initialValues={get(stage, 'stage.spec.infrastructure', {})}
              onUpdate={(value: PipelineInfrastructure) => {
                const infraObj: PipelineInfrastructure = get(stage, 'stage.spec.infrastructure', {})
                if (value.environment) {
                  infraObj.environment = value.environment
                  delete infraObj.environmentRef
                } else if (value.environmentRef) {
                  infraObj.environmentRef = value.environmentRef
                  delete infraObj.environment
                }
                debounceUpdatePipeline(pipeline)
              }}
              factory={factory}
              stepViewType={StepViewType.Edit}
            />
          </Card>
        </Layout.Vertical>
        <div className={css.tabHeading} id="infrastructureDefinition">
          <String stringID="pipelineSteps.deploy.infrastructure.infraDefinition" />
        </div>
        <Card className={cx(css.sectionCard)}>
          <div className={css.stepContainer}>
            <div className={css.subheading}>
              <String stringID="pipelineSteps.deploy.infrastructure.selectMethod" />
            </div>
            {renderInfraSelection()}
          </div>
        </Card>
        {!!selectedDeploymentType && isProvisionerEnabled ? (
          <Accordion className={css.sectionCard} activeId="dynamicProvisioning">
            <Accordion.Panel
              id="dynamicProvisioning"
              addDomId={true}
              summary={'Dynamic provisioning'}
              details={
                <StepWidget<InfraProvisioningData>
                  factory={factory}
                  readonly={isReadonly}
                  key={updateKey}
                  initialValues={getProvisionerData(stage || {})}
                  type={StepType.InfraProvisioning}
                  stepViewType={StepViewType.Edit}
                  onUpdate={(value: InfraProvisioningData) => {
                    if (stage) {
                      stage.stage.spec.infrastructure.infrastructureDefinition.provisioner = value.provisioner
                      cleanUpEmptyProvisioner()
                    }
                    debounceUpdatePipeline(pipeline)
                    setProvisionerEnabled(value.provisionerEnabled)
                  }}
                />
              }
            />
          </Accordion>
        ) : null}

        {selectedDeploymentType ? (
          <Card className={css.sectionCard} id="clusterDetails">
            <div className={css.tabSubHeading}>Cluster details</div>
            <Layout.Horizontal>{getClusterConfigurationStep(selectedDeploymentType)}</Layout.Horizontal>
          </Card>
        ) : null}

        <div className={css.navigationButtons}> {props.children}</div>
      </div>
    </div>
  )
}

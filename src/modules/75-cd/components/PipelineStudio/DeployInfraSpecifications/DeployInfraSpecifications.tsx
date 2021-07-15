import React, { useEffect, useState } from 'react'
import YAML from 'yaml'
import { Layout, Card, Text, Accordion, Color, Container } from '@wings-software/uicore'
import { get, isEmpty, isNil, omit, debounce, set } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  ExecutionWrapper,
  getProvisionerExecutionStrategyYamlPromise,
  Infrastructure,
  K8SDirectInfrastructure,
  K8sGcpInfrastructure,
  PipelineInfrastructure,
  StageElementConfig,
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
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployInfraSpecifications/SelectInfrastructureType'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { FeatureFlag } from '@common/featureFlags'
import css from './DeployInfraSpecifications.module.scss'

const DEFAULT_RELEASE_NAME = 'release-<+INFRA_KEY>'
export default function DeployInfraSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const isProvisionerEnabled = useFeatureFlag(FeatureFlag.NG_PROVISIONERS)
  const [initialInfrastructureDefinitionValues, setInitialInfrastructureDefinitionValues] =
    React.useState<Infrastructure>({})
  const [selectedDeploymentType, setSelectedDeploymentType] = React.useState<string | undefined>()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { getString } = useStrings()
  const { submitFormsForTab } = React.useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  React.useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.INFRASTRUCTURE)
    }
  }, [errorMap])

  const {
    state: {
      originalPipeline,
      selectionState: { selectedStageId }
    },
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = React.useContext(PipelineContext)

  const debounceUpdateStage = React.useCallback(
    debounce((stage: StageElementConfig) => updateStage(stage), 100),
    [updateStage]
  )

  const { stage } = getStageFromPipeline(selectedStageId || '')

  const stageRef = React.useRef(stage)
  stageRef.current = stage

  const resetInfrastructureDefinition = (type?: string): void => {
    const stageData = produce(stage, draft => {
      const spec = get(draft, 'stage.spec', {})
      spec.infrastructure = {
        ...spec.infrastructure,
        infrastructureDefinition: {}
      }

      if (type) {
        spec.infrastructure.infrastructureDefinition.type = type
      }
    })

    const initialInfraDefValues = getInfrastructureDefaultValue(stageData, type)
    setInitialInfrastructureDefinitionValues(initialInfraDefValues)

    debounceUpdateStage(stageData?.stage)
    setProvisionerEnabled(false)
  }

  const infraSpec = get(stage, 'stage.spec.infrastructure', null)
  if (isNil(infraSpec)) {
    const spec = get(stage, 'stage.spec', {})
    spec['infrastructure'] = {
      environmentRef: '',
      infrastructureDefinition: {},
      allowSimultaneousDeployments: false
    }
  }

  React.useEffect(() => {
    const type = stage?.stage?.spec?.infrastructure?.infrastructureDefinition?.type
    setSelectedDeploymentType(type)
    const initialInfraDefValues = getInfrastructureDefaultValue(stage, type)
    setInitialInfrastructureDefinitionValues(initialInfraDefValues)
  }, [stage])

  const onUpdateInfrastructureDefinition = (
    extendedSpec: K8SDirectInfrastructure | K8sGcpInfrastructure,
    type: string
  ): void => {
    if (get(stageRef.current, 'stage.spec.infrastructure', null)) {
      const stageData = produce(stageRef.current, draft => {
        const infrastructure = get(draft, 'stage.spec.infrastructure', null)
        infrastructure.infrastructureDefinition = {
          ...infrastructure.infrastructureDefinition,
          type,
          spec: omit(extendedSpec, 'allowSimultaneousDeployments')
        }
        infrastructure.allowSimultaneousDeployments = extendedSpec.allowSimultaneousDeployments ?? false
      })
      debounceUpdateStage(stageData?.stage)
    }
  }

  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(false)
  const [provisionerSnippetLoading, setProvisionerSnippetLoading] = useState<boolean>(false)

  const isProvisionerEmpty = (stageData: StageElementWrapper): boolean => {
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
          const stageData = produce(stage, draft => {
            draft.stage.spec.infrastructure.infrastructureDefinition.provisioner = provisionerSnippet.provisioner
          })
          updateStage(stageData.stage).then(() => {
            setProvisionerSnippetLoading(false)
          })
        }
      })
    }
  }, [provisionerEnabled])

  const cleanUpEmptyProvisioner = (stageData: StageElementWrapper | undefined): boolean => {
    const provisioner = stageData?.stage?.spec?.infrastructure?.infrastructureDefinition?.provisioner
    let isChanged = false

    if (!isNil(provisioner?.steps) && provisioner?.steps.length === 0) {
      delete provisioner.steps
      isChanged = true
    }
    if (!isNil(provisioner?.rollbackSteps) && provisioner?.rollbackSteps.length === 0) {
      delete provisioner.rollbackSteps
      isChanged = true
    }

    if (
      !provisioner?.steps &&
      !provisioner?.rollbackSteps &&
      stageData?.stage?.spec?.infrastructure?.infrastructureDefinition?.provisioner
    ) {
      delete stageData.stage.spec.infrastructure.infrastructureDefinition.provisioner
      isChanged = true
    }

    return isChanged
  }

  useEffect(() => {
    setProvisionerEnabled(!isProvisionerEmpty(stage || {}))

    return () => {
      let isChanged
      const stageData = produce(stage, draft => {
        isChanged = cleanUpEmptyProvisioner(draft)
      })

      if (isChanged) {
        updateStage(stageData?.stage)
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

    provisioner = isNil(provisioner) ? {} : { ...provisioner }

    if (isNil(provisioner.steps)) {
      provisioner.steps = []
    }
    if (isNil(provisioner.rollbackSteps)) {
      provisioner.rollbackSteps = []
    }

    return {
      provisioner: { ...provisioner },
      provisionerEnabled,
      provisionerSnippetLoading,
      originalProvisioner: { ...originalProvisioner }
    }
  }

  const getInfrastructureDefaultValue = (
    stageData: StageElementWrapper | undefined,
    deploymentType: string | undefined
  ): Infrastructure => {
    const infrastructure = get(stageData, 'stage.spec.infrastructure.infrastructureDefinition', null)
    const type = infrastructure?.type || deploymentType
    const allowSimultaneousDeployments = get(stageData, 'stage.spec.infrastructure.allowSimultaneousDeployments', false)
    switch (type) {
      case 'KubernetesDirect': {
        const connectorRef = infrastructure?.spec?.connectorRef
        const namespace = infrastructure?.spec?.namespace
        const releaseName = infrastructure?.spec?.releaseName ?? DEFAULT_RELEASE_NAME
        return {
          connectorRef,
          namespace,
          releaseName,
          allowSimultaneousDeployments
        }
      }
      case 'KubernetesGcp': {
        const connectorRef = infrastructure?.spec?.connectorRef
        const namespace = infrastructure?.spec?.namespace
        const releaseName = infrastructure?.spec?.releaseName ?? DEFAULT_RELEASE_NAME
        const cluster = infrastructure?.spec?.cluster

        return {
          connectorRef,
          namespace,
          releaseName,
          cluster,
          allowSimultaneousDeployments
        }
      }
      default: {
        return {}
      }
    }
  }

  const getClusterConfigurationStep = (type: string): React.ReactElement => {
    switch (type) {
      case 'KubernetesDirect': {
        return (
          <StepWidget<K8SDirectInfrastructure>
            factory={factory}
            key={stage?.stage.identifier}
            readonly={isReadonly}
            initialValues={initialInfrastructureDefinitionValues as K8SDirectInfrastructure}
            type={StepType.KubernetesDirect}
            stepViewType={StepViewType.Edit}
            onUpdate={value =>
              onUpdateInfrastructureDefinition(
                {
                  connectorRef: value.connectorRef,
                  namespace: value.namespace,
                  releaseName: value.releaseName,
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments
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
            key={stage?.stage.identifier}
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
                  allowSimultaneousDeployments: value.allowSimultaneousDeployments
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

  const updateEnvStep = React.useCallback(
    (value: PipelineInfrastructure) => {
      const stageData = produce(stage, draft => {
        const infraObj: PipelineInfrastructure = get(draft, 'stage.spec.infrastructure', {})
        if (value.environment?.identifier) {
          infraObj.environment = value.environment
          delete infraObj.environmentRef
        } else {
          infraObj.environmentRef = value.environmentRef
          delete infraObj.environment
        }
      })
      debounceUpdateStage(stageData?.stage)
    },
    [stage, debounceUpdateStage, stage?.stage?.spec?.infrastructure?.infrastructureDefinition]
  )

  return (
    <div className={css.serviceOverrides} key="1">
      <DeployServiceErrors />
      <div className={css.contentSection} ref={scrollRef}>
        <Layout.Vertical>
          <div className={css.tabHeading} id="environment">
            <String stringID="environment" />
          </div>
          <Card className={cx(css.sectionCard, css.shadow)}>
            <StepWidget
              type={StepType.DeployEnvironment}
              readonly={isReadonly}
              initialValues={{
                environment: get(stage, 'stage.spec.infrastructure.environment', {}),
                environmentRef: get(stage, 'stage.spec.infrastructure.environmentRef', '')
              }}
              onUpdate={val => updateEnvStep(val)}
              factory={factory}
              stepViewType={StepViewType.Edit}
            />
          </Card>
        </Layout.Vertical>
        <div className={css.tabHeading} id="infrastructureDefinition">
          <String stringID="pipelineSteps.deploy.infrastructure.infraDefinition" />
        </div>
        <SelectDeploymentType
          isReadonly={isReadonly}
          selectedInfrastructureType={selectedDeploymentType}
          onChange={deploymentType => {
            setSelectedDeploymentType(deploymentType)
            resetInfrastructureDefinition(deploymentType)
          }}
        />
        {!!selectedDeploymentType && isProvisionerEnabled ? (
          <Accordion className={css.tabHeading} activeId="dynamicProvisioning">
            <Accordion.Panel
              id="dynamicProvisioning"
              addDomId={true}
              summary={'Dynamic provisioning'}
              details={
                <Container padding="medium" style={{ backgroundColor: 'var(--white)' }} className={css.sectionCard}>
                  <StepWidget<InfraProvisioningData>
                    factory={factory}
                    readonly={isReadonly}
                    key={stage?.stage?.identifier}
                    initialValues={getProvisionerData(stage || {})}
                    type={StepType.InfraProvisioning}
                    stepViewType={StepViewType.Edit}
                    onUpdate={(value: InfraProvisioningData) => {
                      if (stage) {
                        const stageData = produce(stage, draft => {
                          set(
                            draft,
                            'stage.spec.infrastructure.infrastructureDefinition.provisioner',
                            value.provisioner
                          )
                          cleanUpEmptyProvisioner(draft)
                        })
                        debounceUpdateStage(stageData.stage)
                      }
                      setProvisionerEnabled(value.provisionerEnabled)
                    }}
                  />
                </Container>
              }
            />
          </Accordion>
        ) : null}

        {selectedDeploymentType ? (
          <Card className={cx(css.sectionCard, css.shadow)} id="clusterDetails">
            <Text style={{ fontWeight: 600, fontSize: 16 }} color={Color.GREY_700} margin={{ bottom: 'medium' }}>
              {getString('cd.steps.common.clusterDetails')}
            </Text>
            {getClusterConfigurationStep(selectedDeploymentType)}
          </Card>
        ) : null}

        <div className={css.navigationButtons}>{props.children}</div>
      </div>
    </div>
  )
}

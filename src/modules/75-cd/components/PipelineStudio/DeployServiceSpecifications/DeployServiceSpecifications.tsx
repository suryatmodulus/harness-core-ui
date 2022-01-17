/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Card,
  SelectOption,
  Checkbox,
  FormikForm,
  Container,
  Color,
  Text,
  useToaster
} from '@wings-software/uicore'

import produce from 'immer'
import { get, set, debounce, isEmpty } from 'lodash-es'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ServiceConfig, StageElementConfig, useGetServiceList } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getStageIndexFromPipeline,
  getFlattenedStages
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import PropagateWidget, {
  setupMode
} from '@cd/components/PipelineStudio/DeployServiceSpecifications/PropagateWidget/PropagateWidget'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployServiceSpecifications/SelectDeploymentType'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useDeepCompareEffect } from '@common/hooks'
import { StageType } from '@pipeline/utils/stageHelpers'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export default function DeployServiceSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    allowableTypes,
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { showError } = useToaster()
  const { NG_NATIVE_HELM } = useFeatureFlags()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce((stage?: StageElementConfig) => (stage ? updateStage(stage) : Promise.resolve()), 300),
    [updateStage]
  )
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const getDeploymentType = (): string => {
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', !NG_NATIVE_HELM ? 'Kubernetes' : undefined)
  }

  const [setupModeType, setSetupMode] = useState('')
  const [checkedItems, setCheckedItems] = useState({
    overrideSetCheckbox: false
  })
  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption>()
  const [serviceIdNameMap, setServiceIdNameMap] = useState<{ [key: string]: string }>()
  const [selectedDeploymentType, setSelectedDeploymentType] = useState(getDeploymentType())
  const [previousStageList, setPreviousStageList] = useState<SelectOption[]>([])

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  useEffect(() => {
    if (
      !stage?.stage?.spec?.serviceConfig?.serviceDefinition &&
      !stage?.stage?.spec?.serviceConfig?.useFromStage?.stage &&
      stage?.stage?.type === StageType.DEPLOY
    ) {
      setDefaultServiceSchema()
    }
  }, [])

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.SERVICE)
    }
  }, [errorMap])

  const { data: serviceResponse } = useGetServiceList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  useEffect(() => {
    const serviceIdNameMapping: { [key: string]: string } = {}
    serviceResponse?.data?.content?.forEach(service => {
      if (service.service?.identifier) {
        serviceIdNameMapping[service.service?.identifier] = service.service?.name || ''
      }
    })
    setServiceIdNameMap(serviceIdNameMapping)
  }, [serviceResponse])

  useDeepCompareEffect(() => {
    if (stages && stages.length > 0) {
      const newPreviousStageList: SelectOption[] = []
      const currentStageType = stage?.stage?.type
      stages.forEach((item, index) => {
        if (
          index < stageIndex &&
          currentStageType === item?.stage?.type &&
          !get(item.stage, `spec.serviceConfig.useFromStage.stage`)
        ) {
          let serviceName = (item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig.service?.name
          if (isEmpty(serviceName) && serviceIdNameMap) {
            serviceName =
              serviceIdNameMap[(item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig.serviceRef as string]
          }
          if (isEmpty(serviceName)) {
            serviceName = (item.stage as DeploymentStageElementConfig)?.spec?.serviceConfig.serviceRef || ''
          }
          newPreviousStageList.push({
            label: `Stage [${item.stage?.name}] - Service [${serviceName}]`,
            value: item.stage?.identifier || ''
          })
        }
      })
      setPreviousStageList(newPreviousStageList)
    }
  }, [stages, serviceIdNameMap])

  useEffect(() => {
    if (stageIndex === 0) {
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stageIndex])

  useEffect(() => {
    const useFromStage = stage?.stage?.spec?.serviceConfig?.useFromStage
    const stageOverrides = stage?.stage?.spec?.serviceConfig?.stageOverrides

    if (useFromStage) {
      setSetupMode(setupMode.PROPAGATE)
      if (previousStageList && previousStageList.length > 0) {
        const selectedIdentifier = useFromStage?.stage
        const selectedOption = previousStageList.find(v => v.value === selectedIdentifier)
        setSelectedPropagatedState(selectedOption)
        setCheckedItems({
          ...checkedItems,
          overrideSetCheckbox: !!stageOverrides
        })
      }
    } else {
      setSetupMode(setupMode.DIFFERENT)
      setSelectedPropagatedState({
        label: '',
        value: ''
      })
      setCheckedItems({
        ...checkedItems,
        overrideSetCheckbox: !!stageOverrides
      })
    }
  }, [stage?.stage?.spec, previousStageList])

  useEffect(() => {
    if (selectedPropagatedState && selectedPropagatedState.value) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.useFromStage', { stage: selectedPropagatedState.value })
        }
        if (draft?.stage?.spec?.serviceConfig?.serviceDefinition) {
          delete draft.stage.spec.serviceConfig.serviceDefinition
        }
        if (draft?.stage?.spec?.serviceConfig?.serviceRef !== undefined) {
          delete draft.stage.spec.serviceConfig.serviceRef
        }
      })
      debounceUpdateStage(stageData?.stage)
    }
  }, [selectedPropagatedState])

  const setDefaultServiceSchema = (): Promise<void> => {
    const stageData = produce(stage, draft => {
      if (draft) {
        set(draft, 'stage.spec', {
          ...stage?.stage?.spec,
          serviceConfig: {
            serviceRef: '',
            serviceDefinition: {
              type: !NG_NATIVE_HELM ? 'Kubernetes' : undefined,
              spec: {
                variables: []
              }
            }
          }
        })
      }
    })

    return debounceUpdateStage(stageData?.stage)
  }

  const setStageOverrideSchema = (): Promise<void> => {
    const stageData = produce(stage, draft => {
      if (draft) {
        set(draft, 'stage.spec', {
          ...stage?.stage?.spec,
          serviceConfig: {
            ...stage?.stage?.spec?.serviceConfig,
            stageOverrides: {
              artifacts: {
                // primary: null,
                sidecars: []
              },
              manifests: [],
              variables: []
            }
          }
        })
      }
      if (draft?.stage?.spec?.serviceConfig.serviceDefinition) {
        delete draft.stage.spec.serviceConfig.serviceDefinition
      }
    })

    return debounceUpdateStage(stageData?.stage)
  }

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const _isChecked = (event.target as HTMLInputElement).checked
    setCheckedItems({
      ...checkedItems,
      overrideSetCheckbox: _isChecked
    })
    if (_isChecked) {
      setStageOverrideSchema()
    } else {
      const stageData = produce(stage, draft => {
        if (stage?.stage?.spec?.serviceConfig?.stageOverrides) {
          delete draft?.stage?.spec?.serviceConfig?.stageOverrides
        }
      })

      debounceUpdateStage(stageData?.stage)
    }
  }

  const updateService = useCallback(
    (value: ServiceConfig) => {
      const stageData = produce(stage, draft => {
        const serviceObj = get(draft, 'stage.spec.serviceConfig', {})
        if (value.service) {
          serviceObj.service = value.service
          delete serviceObj.serviceRef
        } else {
          serviceObj.serviceRef = value.serviceRef
          delete serviceObj.service
        }
      })
      debounceUpdateStage(stageData?.stage)
    },
    [debounceUpdateStage, stage, stage?.stage?.spec?.serviceConfig?.serviceDefinition]
  )

  const handleDeploymentTypeChange = async (deploymentType: string): Promise<void> => {
    try {
      const stageData = produce(stage, draft => {
        const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
        serviceDefinition.type = deploymentType
      })
      await debounceUpdateStage(stageData?.stage)
      setSelectedDeploymentType(deploymentType)
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  return (
    <FormikForm>
      <div className={stageCss.serviceOverrides} ref={scrollRef}>
        <DeployServiceErrors />
        <div className={stageCss.contentSection}>
          {previousStageList.length > 0 && (
            <Container margin={{ bottom: 'xlarge', left: 'xlarge' }}>
              <PropagateWidget
                setupModeType={setupModeType}
                selectedPropagatedState={selectedPropagatedState}
                previousStageList={previousStageList}
                isReadonly={isReadonly}
                setSetupMode={setSetupMode}
                setSelectedPropagatedState={setSelectedPropagatedState}
                initWithServiceDefinition={setDefaultServiceSchema}
              />
              {setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.value && (
                <Container margin={{ top: 'large' }}>
                  <Container padding={{ bottom: 'small' }} border={{ bottom: true }}>
                    <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
                      {getString('cd.pipelineSteps.serviceTab.stageOverrides')}
                    </Text>
                  </Container>
                  <Checkbox
                    color={Color.GREY_500}
                    font={{ weight: 'semi-bold' }}
                    margin={{ top: 'medium' }}
                    label={getString('cd.pipelineSteps.serviceTab.overrideChanges')}
                    checked={checkedItems.overrideSetCheckbox}
                    onChange={handleChange}
                  />
                </Container>
              )}
            </Container>
          )}
          {setupModeType === setupMode.DIFFERENT ? (
            <>
              <div className={stageCss.tabHeading}>{getString('cd.pipelineSteps.serviceTab.aboutYourService')}</div>
              <Card className={stageCss.sectionCard} id="aboutService">
                <StepWidget
                  type={StepType.DeployService}
                  readonly={isReadonly}
                  initialValues={{
                    service: get(stage, 'stage.spec.serviceConfig.service', {}),
                    serviceRef: get(stage, 'stage.spec.serviceConfig.serviceRef', '')
                  }}
                  allowableTypes={allowableTypes}
                  onUpdate={data => updateService(data)}
                  factory={factory}
                  stepViewType={StepViewType.Edit}
                />
              </Card>
              <div className={stageCss.tabHeading} id="serviceDefinition">
                {getString('pipelineSteps.deploy.serviceSpecifications.serviceDefinition')}
              </div>
              <SelectDeploymentType
                selectedDeploymentType={selectedDeploymentType}
                isReadonly={isReadonly}
                handleDeploymentTypeChange={handleDeploymentTypeChange}
              />
              <Layout.Horizontal>
                <StepWidget<K8SDirectServiceStep>
                  factory={factory}
                  readonly={isReadonly}
                  initialValues={{
                    stageIndex,
                    setupModeType
                  }}
                  allowableTypes={allowableTypes}
                  type={StepType.K8sServiceSpec}
                  stepViewType={StepViewType.Edit}
                />
              </Layout.Horizontal>
            </>
          ) : (
            checkedItems.overrideSetCheckbox &&
            selectedPropagatedState?.value && (
              <StepWidget<K8SDirectServiceStep>
                factory={factory}
                readonly={isReadonly}
                initialValues={{
                  stageIndex,
                  setupModeType
                }}
                allowableTypes={allowableTypes}
                type={StepType.K8sServiceSpec}
                stepViewType={StepViewType.Edit}
              />
            )
          )}
          {((setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.value) ||
            setupModeType === setupMode.DIFFERENT) && (
            <Container margin={{ top: 'xxlarge' }}>{props.children}</Container>
          )}
        </div>
      </div>
    </FormikForm>
  )
}

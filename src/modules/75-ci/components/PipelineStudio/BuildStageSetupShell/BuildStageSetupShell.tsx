/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Expander } from '@blueprintjs/core'
import { cloneDeep, isEmpty, isEqual, set, get } from 'lodash-es'
import produce from 'immer'
import { Tabs, Tab, Icon, Button, Layout, Color, ButtonVariation } from '@wings-software/uicore'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import { useFeatureFlags, useFeatureFlag } from '@common/hooks/useFeatureFlag'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import {
  generateRandomString,
  STATIC_SERVICE_GROUP_NAME,
  StepType
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StepType as StepsStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { K8sDirectInfraYaml, UseFromStageInfraYaml, VmInfraYaml, VmPoolYaml } from 'services/ci'
import { FeatureFlag } from '@common/featureFlags'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import BuildInfraSpecifications from '../BuildInfraSpecifications/BuildInfraSpecifications'
import BuildStageSpecifications from '../BuildStageSpecifications/BuildStageSpecifications'
import BuildAdvancedSpecifications from '../BuildAdvancedSpecifications/BuildAdvancedSpecifications'
import { BuildTabs } from '../CIPipelineStagesUtils'
import css from './BuildStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'approval-stage-icon',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom'
}

interface StagesFilledStateFlags {
  specifications: boolean
  infra: boolean
  execution: boolean
}

export default function BuildStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const { CI_VM_INFRASTRUCTURE } = useFeatureFlags()
  const isTemplatesEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const [selectedTabId, setSelectedTabId] = React.useState<BuildTabs>(BuildTabs.OVERVIEW)
  const [filledUpStages, setFilledUpStages] = React.useState<StagesFilledStateFlags>({
    specifications: false,
    infra: false,
    execution: false
  })
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipeline,
      originalPipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId = '', selectedStepId },
      templateTypes
    },
    contextType,
    stepsFactory,
    getStageFromPipeline,
    updatePipelineView,
    isReadonly,
    updateStage,
    setSelectedStepId,
    getStagePathFromPipeline
  } = pipelineContext

  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')
  const [stageData, setStageData] = React.useState<BuildStageElementConfig | undefined>()

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(BuildTabs.EXECUTION)
    }
  }, [selectedStepId])

  React.useEffect(() => {
    // @TODO: add CI Codebase field check if Clone Codebase is checked
    // once it is added to BuildStageSpecifications (CI-757)
    const specifications = !!(stageData?.name && stageData?.identifier)
    const infra = !!(
      ((stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef &&
        (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace) ||
      (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage ||
      ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.identifier
    )
    const execution = !!stageData?.spec?.execution?.steps?.length
    setFilledUpStages({ specifications, infra, execution })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stageData?.name,
    stageData?.identifier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage,
    ((stageData?.spec?.infrastructure as VmInfraYaml)?.spec as VmPoolYaml)?.spec?.identifier,
    stageData?.spec?.execution?.steps?.length
  ])

  React.useEffect(() => {
    if (selectedStageId && isSplitViewOpen) {
      const { stage } = cloneDeep(getStageFromPipeline<BuildStageElementConfig>(selectedStageId))
      const key = Object.keys(stage || {})[0]
      if (key && stage && !isEqual(stage[key as 'stage'], stageData)) {
        setStageData(stage[key as 'stage'])
      }
    }
  }, [selectedStageId, pipeline, isSplitViewOpen])

  const { checkErrorsForTab } = React.useContext(StageErrorContext)

  const handleTabChange = (data: BuildTabs) => {
    checkErrorsForTab(selectedTabId).then(_ => {
      setSelectedTabId(data)
    })
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      const parent = layoutRef.current.parentElement
      if (parent && parent.scrollTo) {
        parent.scrollTo(0, 0)
      }
    }
  }, [selectedTabId])

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })
  const selectedStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId).stage
  const originalStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId, originalPipeline).stage
  const infraHasWarning = !filledUpStages.infra
  const executionHasWarning = !filledUpStages.execution

  // NOTE: set empty arrays, required by ExecutionGraph
  const selectedStageClone = cloneDeep(selectedStage)
  if (selectedStageClone) {
    if (!selectedStageClone.stage?.spec?.serviceDependencies) {
      set(selectedStageClone, 'stage.spec.serviceDependencies', [])
    }
    if (!selectedStageClone.stage?.spec?.execution?.steps) {
      set(selectedStageClone, 'stage.spec.execution.steps', [])
    }
  }

  const navBtns = (
    <Layout.Horizontal spacing="medium" className={css.footer}>
      <Button
        text={getString('ci.previous')}
        icon="chevron-left"
        disabled={selectedTabId === BuildTabs.OVERVIEW}
        onClick={() =>
          handleTabChange(
            selectedTabId === BuildTabs.ADVANCED
              ? BuildTabs.EXECUTION
              : selectedTabId === BuildTabs.EXECUTION
              ? BuildTabs.INFRASTRUCTURE
              : BuildTabs.OVERVIEW
          )
        }
        variation={ButtonVariation.SECONDARY}
      />
      {selectedTabId === BuildTabs.ADVANCED ? (
        contextType === PipelineContextType.Pipeline ? (
          <Button
            text="Done"
            intent="primary"
            onClick={() => {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
            }}
            variation={ButtonVariation.PRIMARY}
          />
        ) : null
      ) : (
        <Button
          text={selectedTabId === BuildTabs.EXECUTION ? getString('ci.save') : getString('ci.next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === BuildTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              handleTabChange(selectedTabId === BuildTabs.OVERVIEW ? BuildTabs.INFRASTRUCTURE : BuildTabs.EXECUTION)
            }
          }}
          variation={ButtonVariation.PRIMARY}
        />
      )}
    </Layout.Horizontal>
  )

  const shouldEnableDependencies = React.useCallback((): boolean => {
    const isPropagatedStage = !isEmpty((stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage)
    if (isPropagatedStage) {
      const { stage: baseStage } = getStageFromPipeline<BuildStageElementConfig>(
        (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
      )
      return (get(baseStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']) !== 'VM'
    } else {
      return (get(stageData, 'spec.infrastructure.type') as K8sDirectInfraYaml['type']) !== 'VM'
    }
  }, [stageData])

  return (
    <section className={css.setupShell} ref={layoutRef} key={selectedStageId}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId}>
        <Tab
          id={BuildTabs.OVERVIEW}
          panel={<BuildStageSpecifications>{navBtns}</BuildStageSpecifications>}
          title={
            <span className={css.tab}>
              <Icon name="ci-main" height={14} size={14} />
              Overview
            </span>
          }
          data-testid={getString('overview')}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={BuildTabs.INFRASTRUCTURE}
          title={
            <span className={css.tab}>
              <Icon
                name={infraHasWarning ? 'warning-sign' : 'infrastructure'}
                size={infraHasWarning ? 16 : 20}
                color={infraHasWarning ? Color.ORANGE_500 : undefined}
              />
              {getString('ci.infraLabel')}
            </span>
          }
          panel={<BuildInfraSpecifications>{navBtns}</BuildInfraSpecifications>}
          data-testid={getString('ci.infraLabel')}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={BuildTabs.EXECUTION}
          title={
            <span className={css.tab}>
              <Icon
                name={executionHasWarning ? 'warning-sign' : 'execution'}
                size={executionHasWarning ? 16 : 20}
                color={executionHasWarning ? Color.ORANGE_500 : undefined}
              />
              {getString('ci.executionLabel')}
            </span>
          }
          panel={
            selectedStageClone ? (
              <ExecutionGraph
                allowAddGroup={false}
                hasRollback={false}
                isReadonly={isReadonly}
                hasDependencies={CI_VM_INFRASTRUCTURE ? shouldEnableDependencies() : true}
                stepsFactory={stepsFactory}
                stage={selectedStageClone}
                originalStage={originalStage}
                ref={executionRef}
                templateTypes={templateTypes}
                updateStage={newStageData => {
                  const newData = produce(newStageData, draft => {
                    // cleanup rollbackSteps (note: rollbackSteps does not exist on CI stage at all)
                    if (draft?.stage?.spec?.execution?.rollbackSteps) {
                      delete draft.stage.spec.execution.rollbackSteps
                    }
                    // delete serviceDependencies if its empty array (as serviceDependencies is optional)
                    if (draft?.stage?.spec?.serviceDependencies && isEmpty(draft?.stage?.spec?.serviceDependencies)) {
                      delete draft.stage.spec.serviceDependencies
                    }
                  })

                  if (newData.stage) {
                    updateStage(newData.stage)
                  }
                }}
                // Check and update the correct stage path here
                pathToStage={`${stagePath}.stage.spec.execution`}
                onAddStep={(event: ExecutionGraphAddStepEvent) => {
                  if (event.parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
                    updatePipelineView({
                      ...pipelineView,
                      isDrawerOpened: true,
                      drawerData: {
                        type: DrawerTypes.ConfigureService,
                        data: {
                          stepConfig: {
                            node: {
                              type: StepsStepType.Dependency,
                              name: '',
                              identifier: generateRandomString(StepsStepType.Dependency)
                            },
                            stepsMap: event.stepsMap,
                            onUpdate: executionRef.current?.stepGroupUpdated,
                            addOrEdit: 'add',
                            isStepGroup: false,
                            hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                          }
                        }
                      }
                    })
                  } else {
                    if (event.isTemplate) {
                      addTemplate(event)
                    } else {
                      updatePipelineView({
                        ...pipelineView,
                        isDrawerOpened: true,
                        drawerData: {
                          type: DrawerTypes.AddStep,
                          data: {
                            paletteData: {
                              entity: event.entity,
                              stepsMap: event.stepsMap,
                              onUpdate: executionRef.current?.stepGroupUpdated,
                              // isAddStepOverride: true,
                              isRollback: event.isRollback,
                              isParallelNodeClicked: event.isParallel,
                              hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                            }
                          }
                        }
                      })
                    }
                  }
                }}
                onEditStep={(event: ExecutionGraphEditStepEvent) => {
                  updatePipelineView({
                    ...pipelineView,
                    isDrawerOpened: true,
                    drawerData: {
                      type: event.stepType === StepType.STEP ? DrawerTypes.StepConfig : DrawerTypes.ConfigureService,
                      data: {
                        stepConfig: {
                          node: event.node as any,
                          stepsMap: event.stepsMap,
                          onUpdate: executionRef.current?.stepGroupUpdated,
                          isStepGroup: event.isStepGroup,
                          isUnderStepGroup: event.isUnderStepGroup,
                          addOrEdit: event.addOrEdit,
                          hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                        }
                      }
                    }
                  })
                }}
                onSelectStep={(stepId: string) => {
                  setSelectedStepId(stepId)
                }}
                selectedStepId={selectedStepId}
              />
            ) : undefined
          }
          data-testid={getString('ci.executionLabel')}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={BuildTabs.ADVANCED}
          title={
            <span className={css.tab}>
              <Icon name="advanced" height={20} size={20} />
              {getString('ci.advancedLabel')}
            </span>
          }
          panel={<BuildAdvancedSpecifications>{navBtns}</BuildAdvancedSpecifications>}
          data-testid={getString('ci.advancedLabel')}
        />
        {contextType === PipelineContextType.Pipeline && isTemplatesEnabled && selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton data={selectedStage?.stage} type={'Stage'} />
          </>
        )}
      </Tabs>
    </section>
  )
}

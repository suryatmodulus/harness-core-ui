import React from 'react'
import { cloneDeep, isEmpty, isEqual, set } from 'lodash-es'
import produce from 'immer'
import { Tabs, Tab, Icon, Button, Layout, Color } from '@wings-software/uicore'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
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
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { K8sDirectInfraYaml, UseFromStageInfraYaml } from 'services/ci'
import BuildInfraSpecifications from '../BuildInfraSpecifications/BuildInfraSpecifications'
import BuildStageSpecifications from '../BuildStageSpecifications/BuildStageSpecifications'
import BuildAdvancedSpecifications from '../BuildAdvancedSpecifications/BuildAdvancedSpecifications'
import css from './BuildStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'pipeline-approval',
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

  const stageNames: string[] = [getString('overview'), getString('ci.infraLabel'), getString('ci.executionLabel')]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(getString('overview'))
  const [filledUpStages, setFilledUpStages] = React.useState<StagesFilledStateFlags>({
    specifications: false,
    infra: false,
    execution: false
  })
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const {
    state: {
      pipeline,
      originalPipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId = '', selectedStepId }
    },
    stepsFactory,
    getStageFromPipeline,
    updatePipelineView,
    isReadonly,
    updateStage,
    setSelectedStepId,
    getStagePathFromPipeline
  } = React.useContext(PipelineContext)

  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')
  const [stageData, setStageData] = React.useState<BuildStageElementConfig | undefined>()

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(getString('ci.executionLabel'))
    }
  }, [selectedStepId])

  React.useEffect(() => {
    // @TODO: add CI Codebase field check if Clone Codebase is checked
    // once it is added to BuildStageSpecifications (CI-757)
    const specifications = !!(stageData?.name && stageData?.identifier)
    const infra = !!(
      ((stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef &&
        (stageData?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace) ||
      (stageData?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
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
    if (stageNames.indexOf(selectedStageId) !== -1) {
      setSelectedTabId(selectedStageId)
    }
  }, [selectedStageId, pipeline, isSplitViewOpen, stageNames])

  const handleTabChange = (data: string) => {
    setSelectedTabId(data)
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
  const selectedStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId).stage
  const originalStage = getStageFromPipeline<BuildStageElementConfig>(selectedStageId, originalPipeline).stage
  const infraHasWarning = !filledUpStages.infra
  const executionHasWarning = !filledUpStages.execution

  // NOTE: set empty arrays, required by ExecutionGraph
  const selectedStageClone = cloneDeep(selectedStage || {})
  if (selectedStageClone) {
    if (!selectedStageClone.stage?.spec?.serviceDependencies) {
      set(selectedStageClone, 'stage.spec.serviceDependencies', [])
    }
    if (!selectedStageClone.stage?.spec?.execution?.steps) {
      set(selectedStageClone, 'stage.spec.execution.steps', [])
    }
  }

  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={getString('ci.previous')}
        icon="chevron-left"
        disabled={selectedTabId === getString('overview')}
        onClick={() =>
          setSelectedTabId(
            selectedTabId === getString('ci.advancedLabel')
              ? getString('ci.executionLabel')
              : selectedTabId === getString('ci.executionLabel')
              ? getString('ci.infraLabel')
              : getString('overview')
          )
        }
      />
      {selectedTabId === getString('ci.advancedLabel') ? (
        <Button
          text="Done"
          intent="primary"
          onClick={() => {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
          }}
        />
      ) : (
        <Button
          text={selectedTabId === getString('ci.executionLabel') ? getString('ci.save') : getString('ci.next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === getString('ci.executionLabel')) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              setSelectedTabId(
                selectedTabId === getString('overview') ? getString('ci.infraLabel') : getString('ci.executionLabel')
              )
            }
          }}
        />
      )}
    </Layout.Horizontal>
  )

  return (
    <section className={css.setupShell} ref={layoutRef} key={selectedStageId}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId}>
        <Tab
          id={getString('overview')}
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
          id={getString('ci.infraLabel')}
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
          id={getString('ci.executionLabel')}
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
            <ExecutionGraph
              allowAddGroup={false}
              hasRollback={false}
              isReadonly={isReadonly}
              hasDependencies={true}
              stepsFactory={stepsFactory}
              stage={selectedStageClone}
              originalStage={originalStage}
              ref={executionRef}
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
          id={getString('ci.advancedLabel')}
          title={
            <span className={css.tab}>
              <Icon name="advanced" height={20} size={20} />
              {getString('ci.advancedLabel')}
            </span>
          }
          panel={<BuildAdvancedSpecifications>{navBtns}</BuildAdvancedSpecifications>}
          data-testid={getString('ci.advancedLabel')}
        />
      </Tabs>
    </section>
  )
}

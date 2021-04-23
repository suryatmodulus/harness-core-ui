import React from 'react'
import { set } from 'lodash-es'
import { Tabs, Tab, Icon, Button, Layout } from '@wings-software/uicore'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StageElementWrapper } from 'services/cd-ng'
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
    updatePipeline,
    setSelectedStepId
  } = React.useContext(PipelineContext)

  const [stageData, setStageData] = React.useState<StageElementWrapper | undefined>()

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(getString('ci.executionLabel'))
    }
  }, [selectedStepId])

  React.useEffect(() => {
    // @TODO: add CI Codebase field check if Clone Codebase is checked
    // once it is added to BuildStageSpecifications (CI-757)
    const specifications = stageData?.name && stageData?.identifier
    const infra = stageData?.spec?.infrastructure?.spec?.connectorRef || stageData?.spec?.infrastructure?.useFromStage
    const execution = !!stageData?.spec?.execution?.steps?.length
    setFilledUpStages({ specifications, infra, execution })
  }, [
    stageData?.name,
    stageData?.identifier,
    stageData?.spec?.infrastructure?.spec?.connectorRef,
    stageData?.spec?.infrastructure?.useFromStage?.stage,
    stageData?.spec?.execution?.steps?.length
  ])

  React.useEffect(() => {
    if (selectedStageId && isSplitViewOpen) {
      const { stage } = getStageFromPipeline(selectedStageId)
      const key = Object.keys(stage || {})[0]
      if (key && stage) {
        setStageData(stage[key])
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

  React.useEffect(() => {
    const { stage: data } = getStageFromPipeline(selectedStageId)
    if (data) {
      let shouldUpdate = false
      if (!data?.stage?.spec?.execution?.steps) {
        set(data, 'stage.spec.execution.steps', [])
        shouldUpdate = true
      }
      if (!data?.stage?.spec?.serviceDependencies) {
        set(data, 'stage.spec.serviceDependencies', [])
        shouldUpdate = true
      }

      if (shouldUpdate) {
        updatePipeline(pipeline)
      }
    }
  }, [pipeline, selectedStageId])

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage

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
              <Icon name="ci-main" height={20} size={20} />
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
              <Icon name="infrastructure" height={20} size={20} />
              {getString('ci.infraLabel')}
              {filledUpStages.infra ? null : (
                <Icon
                  name="warning-sign"
                  height={10}
                  size={10}
                  color={'orange500'}
                  margin={{ left: 'small', right: 0 }}
                  style={{ verticalAlign: 'baseline' }}
                />
              )}
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
              <Icon name="execution" height={20} size={20} />
              {getString('ci.executionLabel')}
              {filledUpStages.execution ? null : (
                <Icon
                  name="warning-sign"
                  height={10}
                  size={10}
                  color={'orange500'}
                  margin={{ left: 'small', right: 0 }}
                  style={{ verticalAlign: 'baseline' }}
                />
              )}
            </span>
          }
          panel={
            <ExecutionGraph
              allowAddGroup={false}
              hasRollback={false}
              isReadonly={isReadonly}
              hasDependencies={true}
              stepsFactory={stepsFactory}
              stage={selectedStage!}
              originalStage={originalStage}
              ref={executionRef}
              updateStage={() => {
                updatePipeline(pipeline)
              }}
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
                            name: name,
                            identifier: generateRandomString(name)
                          },
                          stepsMap: event.stepsMap,
                          onUpdate: executionRef.current?.stepGroupUpdated,
                          addOrEdit: 'add',
                          isStepGroup: false,
                          hiddenAdvancedPanels: [
                            AdvancedPanels.FailureStrategy,
                            AdvancedPanels.PreRequisites,
                            AdvancedPanels.DelegateSelectors
                          ]
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
                          hiddenAdvancedPanels: [
                            AdvancedPanels.FailureStrategy,
                            AdvancedPanels.PreRequisites,
                            AdvancedPanels.DelegateSelectors
                          ]
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
                        node: event.node,
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

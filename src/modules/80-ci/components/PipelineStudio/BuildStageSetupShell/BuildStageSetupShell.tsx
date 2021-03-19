import React from 'react'
import { set } from 'lodash-es'
import { Tabs, Tab, Icon, Button, Layout } from '@wings-software/uicore'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import { PipelineContext, ExecutionGraph } from '@pipeline/exports'
import type { StageElementWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type {
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
import i18n from './BuildStageSetupShell.i18n'
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

  const stageNames: string[] = [i18n.defaultId, i18n.infraLabel, i18n.executionLabel]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(i18n.defaultId)
  const [filledUpStages, setFilledUpStages] = React.useState<StagesFilledStateFlags>({
    specifications: false,
    infra: false,
    execution: false
  })
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId = '' },
        isSplitViewOpen
      },
      pipelineView
    },
    stepsFactory,
    getStageFromPipeline,
    updatePipelineView,
    updatePipeline
  } = React.useContext(PipelineContext)

  const [stageData, setStageData] = React.useState<StageElementWrapper | undefined>()

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

  function openSkipConditionPanel(): void {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: true,
      drawerData: {
        type: DrawerTypes.SkipCondition
      }
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

  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={i18n.previous}
        icon="chevron-left"
        disabled={selectedTabId === i18n.defaultId}
        onClick={() => setSelectedTabId(selectedTabId === i18n.executionLabel ? i18n.infraLabel : i18n.defaultId)}
      />
      <Button
        text={selectedTabId === i18n.executionLabel ? i18n.save : i18n.next}
        intent="primary"
        rightIcon="chevron-right"
        onClick={() => {
          if (selectedTabId === i18n.executionLabel) {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
          } else {
            setSelectedTabId(selectedTabId === i18n.defaultId ? i18n.infraLabel : i18n.executionLabel)
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <section className={css.setupShell} ref={layoutRef} key={selectedStageId}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId}>
        <Tab
          id={i18n.defaultId}
          panel={<BuildStageSpecifications>{navBtns}</BuildStageSpecifications>}
          title={
            <span className={css.tab}>
              <Icon name="ci-main" height={20} size={20} />
              Stage Overview
            </span>
          }
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
          id={i18n.infraLabel}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-stages" height={20} size={20} />
              {i18n.infraLabel}
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
          id={i18n.executionLabel}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-steps" height={20} size={20} />
              {i18n.executionLabel}
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
              hasDependencies={true}
              stepsFactory={stepsFactory}
              stage={selectedStage!}
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
                          onUpdate: executionRef.current?.stepGroupUpdated,
                          addOrEdit: 'add',
                          isStepGroup: false,
                          hiddenAdvancedPanels: [AdvancedPanels.FailureStrategy, AdvancedPanels.PreRequisites]
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
                          onUpdate: executionRef.current?.stepGroupUpdated,
                          // isAddStepOverride: true,
                          isRollback: event.isRollback,
                          isParallelNodeClicked: event.isParallel,
                          hiddenAdvancedPanels: [AdvancedPanels.FailureStrategy, AdvancedPanels.PreRequisites]
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
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        isStepGroup: event.isStepGroup,
                        isUnderStepGroup: event.isUnderStepGroup,
                        addOrEdit: event.addOrEdit,
                        hiddenAdvancedPanels: [AdvancedPanels.FailureStrategy, AdvancedPanels.PreRequisites]
                      }
                    }
                  }
                })
              }}
            />
          }
        />
        <Button
          minimal
          onClick={openSkipConditionPanel}
          iconProps={{ margin: 'xsmall' }}
          className={css.skipCondition}
          icon="conditional-skip"
        >
          {getString('skipConditionTitle')}
        </Button>
      </Tabs>
    </section>
  )
}

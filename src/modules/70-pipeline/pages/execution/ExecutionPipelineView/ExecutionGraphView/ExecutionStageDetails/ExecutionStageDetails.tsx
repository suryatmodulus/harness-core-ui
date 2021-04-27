import React from 'react'
import { isEmpty, debounce } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { ExecutionNode, useGetBarrierInfo, useGetResourceConstraintsExecutionInfo } from 'services/pipeline-ng'
import { getIconFromStageModule, processExecutionData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { useExecutionLayoutContext } from '@pipeline/components/ExecutionLayout/ExecutionLayoutContext'
import ExecutionStageDiagram from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram'
import type { StageOptions, ExecutionPipeline } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isExecutionPaused, isExecutionRunning } from '@pipeline/utils/statusHelpers'
import { DynamicPopover } from '@common/exports'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import BarrierStepTooltip from './components/BarrierStepTooltip'
import ResourceConstraintTooltip from './components/ResourceConstraints'
import css from './ExecutionStageDetails.module.scss'

export interface ExecutionStageDetailsProps {
  onStepSelect(step?: string): void
  onStageSelect(step: string): void
}

export default function ExecutionStageDetails(props: ExecutionStageDetailsProps): React.ReactElement {
  const {
    pipelineExecutionDetail,
    pipelineStagesMap,
    loading,
    selectedStageId,
    selectedStepId,
    allNodeMap
  } = useExecutionContext()
  const { setStepDetailsVisibility } = useExecutionLayoutContext()
  const [barrierSetupId, setBarrierSetupId] = React.useState<string | null>(null)
  const [resourceUnit, setResourceUnit] = React.useState({ id: null })
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<unknown> | undefined
  >()

  const stagesOptions: StageOptions[] = [...pipelineStagesMap].map(item => ({
    label: item[1].nodeIdentifier || /* istanbul ignore next */ '',
    value: item[1].nodeUuid || /* istanbul ignore next */ '',
    icon: { name: getIconFromStageModule(item[1].module, item[1].nodeType) },
    disabled: item[1].status === 'NotStarted'
  }))

  const { executionIdentifier, accountId } = useParams<ExecutionPathProps>()
  const stage = pipelineStagesMap.get(selectedStageId)
  const { data: barrierInfo, loading: barrierInfoLoading, refetch } = useGetBarrierInfo({
    queryParams: {
      barrierSetupId: barrierSetupId || '',
      planExecutionId: executionIdentifier
    },
    lazy: true
  })
  const {
    data: resourceConstraintsData,
    loading: resourceConstraintsLoading,
    refetch: fetchResourceData
  } = useGetResourceConstraintsExecutionInfo({
    queryParams: {
      resourceUnit: resourceUnit.id || '',
      accountId
    },
    lazy: true
  })
  const data: ExecutionPipeline<ExecutionNode> = {
    items: processExecutionData(pipelineExecutionDetail?.executionGraph),
    identifier: `${executionIdentifier}-${selectedStageId}`,
    status: stage?.status as any,
    allNodes: Object.keys(allNodeMap)
  }
  const fetchData = debounce(refetch, 1000)
  const fetchResourceConstraints = debounce(fetchResourceData, 1000)
  // open details view when a step is selected
  React.useEffect(() => {
    if (barrierSetupId) {
      fetchData()
    }
    if (resourceUnit.id) {
      fetchResourceConstraints()
    }
  }, [barrierSetupId, resourceUnit, fetchResourceConstraints, fetchData])

  // open details view when a step is selected
  React.useEffect(() => {
    setStepDetailsVisibility(!!selectedStepId)
  }, [selectedStepId, setStepDetailsVisibility])

  const onMouseEnter = (event: any): void => {
    const currentStage = event.stage
    const isFinished = currentStage?.data?.endTs
    const hasStarted = currentStage?.data?.startTs
    const status = currentStage?.data?.status
    dynamicPopoverHandler?.show(
      event.stageTarget,
      {
        event,
        data: currentStage
      },
      { useArrows: true, darkMode: false }
    )
    if (!isFinished && hasStarted) {
      if (currentStage?.data?.stepType === StepType.Barrier && status !== 'Success') {
        setBarrierSetupId(currentStage?.data?.setupId)
      }
      if (currentStage?.data?.stepType === StepType.ResourceConstraint) {
        setResourceUnit({ id: currentStage?.data?.stepParameters?.resourceUnit })
      }
    }
  }

  const renderPopover = ({
    data: stepInfo
  }: {
    data: { data: { stepType: string; startTs: number; status: string; stepParameters: { identifier: string } } }
  }): JSX.Element => {
    return (
      <HoverCard
        barrier={{
          barrierInfoLoading,
          barrierData: barrierInfo?.data
        }}
        data={stepInfo}
      >
        {stepInfo?.data?.stepType === StepType.Barrier && stepInfo?.data?.status === 'Running' && (
          <BarrierStepTooltip
            loading={barrierInfoLoading}
            data={{ ...barrierInfo?.data, stepParameters: stepInfo?.data?.stepParameters }}
            startTs={stepInfo?.data?.startTs}
          />
        )}
        {stepInfo?.data?.stepType === StepType.ResourceConstraint && stepInfo?.data?.status === 'Waiting' && (
          <ResourceConstraintTooltip
            loading={resourceConstraintsLoading}
            data={{ executionList: resourceConstraintsData?.data, ...stepInfo, executionId: executionIdentifier }}
          />
        )}
      </HoverCard>
    )
  }
  return (
    <div className={css.main}>
      {!isEmpty(selectedStageId) && data.items?.length > 0 && (
        <ExecutionStageDiagram
          selectedIdentifier={selectedStageId}
          itemClickHandler={e => props.onStepSelect(e.stage.identifier)}
          data={data}
          showEndNode={!(isExecutionRunning(stage?.status) || isExecutionPaused(stage?.status))}
          isWhiteBackground
          nodeStyle={{
            width: 64,
            height: 64
          }}
          loading={loading}
          gridStyle={{
            startX: 50,
            startY: 150
          }}
          showStageSelection={true}
          selectedStage={{
            label: stage?.nodeIdentifier || /* istanbul ignore next */ '',
            value: stage?.nodeUuid || /* istanbul ignore next */ '',
            icon: { name: getIconFromStageModule(stage?.module, stage?.nodeType) }
          }}
          itemMouseEnter={onMouseEnter}
          itemMouseLeave={() => {
            dynamicPopoverHandler?.hide()
            setBarrierSetupId(null)
          }}
          stageSelectionOptions={stagesOptions}
          onChangeStageSelection={(item: StageOptions) => {
            props.onStageSelect(item.value as string)
          }}
          canvasBtnsClass={css.canvasBtns}
        />
      )}
      <DynamicPopover
        className={css.popoverHeight}
        darkMode={true}
        render={renderPopover}
        bind={setDynamicPopoverHandler as any}
        closeOnMouseOut
      />
    </div>
  )
}

import React from 'react'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  ModeEntityNameMap,
  ParentModeEntityNameMap,
  PipelineOrStageStatus,
  statusToStatusMapping,
  StatusToStringIdMapping
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'
import type { StringsMap } from 'stringTypes'
import type { NodeRunInfo } from 'services/pipeline-ng'

export interface ConditionalExecutionToolTipProps {
  mode: Modes
  data: NodeRunInfo
}

const processConditionData = (
  whenCondition: string
): {
  status: PipelineOrStageStatus
  statusStringId: keyof StringsMap
  condition: string | undefined
} => {
  const whenConditionInfo: string[] = whenCondition.split(' && ')
  const statusInfo: string = whenConditionInfo.shift()!.replace(/[^a-zA-Z]/g, '')
  let condition
  if (whenConditionInfo.length > 0) {
    condition = whenConditionInfo.join(' && ').slice(1, -1)
  }
  return {
    status: statusToStatusMapping[statusInfo],
    statusStringId: StatusToStringIdMapping[statusInfo],
    condition
  }
}

export default function ConditionalExecutionTooltip(props: ConditionalExecutionToolTipProps): React.ReactElement {
  const {
    mode,
    data: { whenCondition, evaluatedCondition }
  } = props
  const { getString } = useStrings()
  const { status, statusStringId, condition } = processConditionData(whenCondition!)

  if (status === PipelineOrStageStatus.SUCCESS && !condition?.trim()) {
    return <></>
  }

  return (
    <Layout.Horizontal
      border={{ top: true, width: 1, color: Color.GREY_200 }}
      padding={{ right: 'xlarge', top: 'small', bottom: 'small', left: 'small' }}
    >
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name="conditional-execution" color={Color.GREY_600} size={20} />
      </Container>
      <Layout.Vertical spacing={'xsmall'} style={{ flex: 1 }} data-testid="hovercard-service">
        <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
          {mode === Modes.STAGE && getString('pipeline.conditionalExecution.toolTip.stageTitle')}
          {mode === Modes.STEP && getString('pipeline.conditionalExecution.toolTip.stepTitle')}
        </Text>
        <Text
          padding={{ top: 'xsmall', bottom: condition !== undefined ? 'xsmall' : 'none' }}
          style={{ fontSize: '10px' }}
          color={Color.GREY_900}
        >
          {getString(statusStringId, {
            entity: ModeEntityNameMap[mode],
            parentEntity: ParentModeEntityNameMap[mode]
          })}
          {!!condition && (
            <Text
              inline={true}
              color={Color.BLACK}
              style={{ fontSize: '10px' }}
              padding={{ left: 'xsmall', right: 'xsmall' }}
              margin={{ left: 'xsmall', right: 'xsmall' }}
              background={Color.GREY_100}
              border={{ radius: 3 }}
            >
              {getString('pipeline.and')}
            </Text>
          )}
          {!!condition && getString('pipeline.conditionalExecution.belowExpression')}
        </Text>
        {!!condition && (
          <Container
            padding={'small'}
            background={Color.GREY_100}
            color={Color.GREY_900}
            style={{ fontSize: '12px', wordBreak: 'break-word' }}
            border={{ width: 0.5, color: Color.GREY_200, radius: 4 }}
          >
            {condition}
          </Container>
        )}
        <Text
          padding={{ top: 'small' }}
          style={{ fontSize: '10px' }}
          font={{ weight: 'semi-bold' }}
          color={Color.GREY_500}
        >
          {getString('pipeline.conditionalExecution.toolTip.conditionTitle')}
        </Text>
        <Text style={{ fontSize: '10px' }} color={Color.GREY_900}>
          {evaluatedCondition?.toString() || false.toString()}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

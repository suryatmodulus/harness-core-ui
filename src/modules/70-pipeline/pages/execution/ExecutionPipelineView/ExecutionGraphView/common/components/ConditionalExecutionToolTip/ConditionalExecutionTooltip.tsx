import React from 'react'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  ModeEntityNameMap,
  ParentModeEntityNameMap,
  PipelineOrStageStatus,
  statusToStatusMapping,
  statusToStringIdMapping
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'
import type { StringsMap } from 'stringTypes'
import type { ConditionalExecutionNodeRunInfo } from '@pipeline/utils/types'
import type { ExpressionBlock } from 'services/pipeline-ng'

export interface ConditionalExecutionToolTipProps {
  mode: Modes
  data: ConditionalExecutionNodeRunInfo
}

const processConditionData = (
  whenCondition: string
): {
  status: PipelineOrStageStatus
  statusStringId: keyof StringsMap
  condition: string | null
} => {
  const whenConditionInfo: string[] = whenCondition.split(' && ')
  const statusInfo: string = whenConditionInfo.shift()!.replace(/[^a-zA-Z]/g, '')
  return {
    status: statusToStatusMapping[statusInfo],
    statusStringId: statusToStringIdMapping[statusInfo],
    condition: whenConditionInfo.length > 0 ? whenConditionInfo.join(' && ').slice(1, -1) : null
  }
}

export interface ResolvedVariableInterface {
  fullExpression: string
  trimmedExpression: string
  expressionValue: string
}

const processResolvedVariables = (expressions: ExpressionBlock[] | undefined) => {
  const resolvedVariables: ResolvedVariableInterface[] = []
  expressions?.forEach(expression => {
    const expressionStr: string | undefined = expression.expression
    if (!!expressionStr && !statusToStatusMapping[expressionStr]) {
      resolvedVariables.push({
        fullExpression: expressionStr,
        trimmedExpression: expressionStr.split('.').pop() || '',
        expressionValue: expression.expressionValue || ''
      })
    }
  })
  return resolvedVariables
}

export default function ConditionalExecutionTooltip(props: ConditionalExecutionToolTipProps): React.ReactElement {
  const {
    mode,
    data: { whenCondition, expressions }
  } = props
  const { getString } = useStrings()
  const { status, statusStringId, condition } = processConditionData(whenCondition!)
  const resolvedVariables = processResolvedVariables(expressions)

  if (status === PipelineOrStageStatus.SUCCESS && !condition?.trim()) {
    return <></>
  }

  return (
    <Layout.Horizontal
      border={{ top: true, width: 0.5, color: Color.GREY_100 }}
      padding={{ right: 'xlarge', top: 'small', bottom: 'small', left: 'small' }}
    >
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name="conditional-execution" color={Color.GREY_600} size={20} />
      </Container>
      <Layout.Vertical
        spacing={'xsmall'}
        style={{ flex: 1 }}
        data-testid="hovercard-service"
        padding={{ top: 'xsmall', bottom: 'xsmall' }}
      >
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {mode === Modes.STAGE && getString('pipeline.conditionalExecution.toolTip.stageTitle')}
          {mode === Modes.STEP && getString('pipeline.conditionalExecution.toolTip.stepTitle')}
        </Text>
        <Text
          padding={{
            top: condition ? 'xsmall' : 'none',
            bottom: condition ? 'xsmall' : 'none'
          }}
          font={{ size: 'xsmall' }}
          style={{ lineHeight: '16px' }}
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
              font={{ size: 'xsmall', weight: 'semi-bold' }}
              padding={{ left: 'xsmall', right: 'xsmall' }}
              margin={{ left: 'xsmall', right: 'xsmall' }}
              background={Color.GREY_100}
              border={{ radius: 3, color: Color.GREY_100 }}
            >
              {getString('pipeline.and')}
            </Text>
          )}
          {!!condition && getString('pipeline.conditionalExecution.belowExpression')}
        </Text>
        {!!condition && (
          <Container
            padding={'small'}
            color={Color.GREY_900}
            font={{ size: 'small' }}
            style={{ wordBreak: 'break-word', background: '#FAFBFC' }}
            border={{ width: 0.5, color: Color.GREY_100, radius: 4 }}
          >
            {condition}
          </Container>
        )}
        {resolvedVariables.length > 0 && (
          <Layout.Vertical spacing={'xsmall'} padding={{ top: 'medium' }}>
            <Text padding={{ bottom: 'xsmall' }} font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_500}>
              {getString('pipeline.conditionalExecution.toolTip.resolvedVariables')}
            </Text>
            {resolvedVariables.map(resolvedVariable => {
              return (
                <Text
                  key={resolvedVariable.fullExpression}
                  style={{ wordBreak: 'break-word' }}
                  font={{ size: 'xsmall' }}
                  color={Color.GREY_900}
                >
                  {resolvedVariable.fullExpression !== resolvedVariable.trimmedExpression ? (
                    <Text font={{ size: 'xsmall' }} color={Color.GREY_900} tooltip={resolvedVariable.fullExpression}>
                      {resolvedVariable.trimmedExpression}
                    </Text>
                  ) : (
                    resolvedVariable.trimmedExpression
                  )}
                  {' = '}
                  {resolvedVariable.expressionValue}
                </Text>
              )
            })}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

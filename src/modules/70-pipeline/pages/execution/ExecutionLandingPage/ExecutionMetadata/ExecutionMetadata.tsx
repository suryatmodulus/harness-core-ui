import React from 'react'
import { Text, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { hasCDStage, hasCIStage, StageType } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/factories/ExecutionFactory'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { UserLabel } from '@common/components/UserLabel/UserLabel'

import css from './ExecutionMetadata.module.scss'

const ExecutionMetadataTrigger = () => {
  const { getString } = useStrings()

  const { pipelineExecutionDetail } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}

  const type = pipelineExecutionSummary?.executionTriggerInfo?.triggerType

  if (type === 'WEBHOOK' || type === 'WEBHOOK_CUSTOM' || type === 'SCHEDULER_CRON') {
    return (
      <div className={css.trigger}>
        <Icon
          size={14}
          name={type === 'SCHEDULER_CRON' ? 'stopwatch' : 'trigger-execution'}
          margin={{ right: 'small' }}
        />
        <Text font={{ size: 'small' }} color="primary6" margin={{ right: 'xsmall' }}>
          {pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier}
        </Text>
        <Text font={{ size: 'small' }} color="grey500">
          ({getString(mapTriggerTypeToStringID(type))})
        </Text>
      </div>
    )
  } else {
    return (
      <div style={{ fontSize: 0 }}>
        <UserLabel
          name={
            pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier ||
            pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.extraInfo?.email ||
            ''
          }
          email={pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.extraInfo?.email}
          iconProps={{ size: 16 }}
        />
      </div>
    )
  }
}

export default function ExecutionMetadata(): React.ReactElement {
  const { pipelineExecutionDetail, pipelineStagesMap } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}

  const HAS_CD = hasCDStage(pipelineExecutionSummary)
  const HAS_CI = hasCIStage(pipelineExecutionSummary)
  const ciData = factory.getSummary(StageType.BUILD)
  const cdData = factory.getSummary(StageType.DEPLOY)

  return (
    <div className={css.main}>
      {HAS_CI && ciData
        ? React.createElement(ciData.component, {
            data: pipelineExecutionSummary?.moduleInfo?.ci,
            nodeMap: pipelineStagesMap
          })
        : null}
      {HAS_CD && cdData
        ? React.createElement(cdData.component, {
            data: pipelineExecutionSummary?.moduleInfo?.cd,
            nodeMap: pipelineStagesMap
          })
        : null}
      <ExecutionMetadataTrigger />
    </div>
  )
}

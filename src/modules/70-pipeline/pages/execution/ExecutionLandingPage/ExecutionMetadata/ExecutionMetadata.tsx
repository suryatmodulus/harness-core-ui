import React from 'react'
import { Icon } from '@wings-software/uicore'

import { String } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { hasCDStage, hasCIStage, StageType } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/factories/ExecutionFactory'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'

import css from './ExecutionMetadata.module.scss'

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
      <div className={css.trigger}>
        <Icon className={css.triggerIcon} size={14} name="trigger-execution" />
        <String
          tagName="div"
          className={css.triggerText}
          stringID={mapTriggerTypeToStringID(pipelineExecutionSummary?.executionTriggerInfo?.triggerType)}
        />
      </div>
    </div>
  )
}

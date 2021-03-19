import React from 'react'
import { useHistory } from 'react-router-dom'
import { Popover, IPopoverProps } from '@blueprintjs/core'
import { get } from 'lodash-es'
import cx from 'classnames'
import { Icon } from '@wings-software/uicore'

import { String } from 'framework/exports'
import { Duration } from '@common/exports'
import { ExecutionStatusIconMap as IconMap, getStageType } from '@pipeline/utils/executionUtils'
import { ExecutionStatus, isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import routes from '@common/RouteDefinitions'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { GraphLayoutNode } from 'services/pipeline-ng'

import css from './MiniExecutionGraph.module.scss'

export function RunningIcon(): React.ReactElement {
  return (
    <div className={css.runningAnimation}>
      <div />
      <div />
      <div />
    </div>
  )
}

export interface StageNodeProps extends Omit<IPopoverProps, 'content'>, PipelinePathProps, ModulePathParams {
  stage: GraphLayoutNode
  planExecutionId: string
}

export function StageNode(props: StageNodeProps): React.ReactElement {
  const {
    accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    module,
    stage,
    planExecutionId,
    ...rest
  } = props
  const { moduleInfo, status } = stage || {}
  const statusLower = status?.toLowerCase() || ''
  const history = useHistory()

  const stageType = getStageType(stage)
  const HAS_CD = stageType === 'cd'
  const HAS_CI = stageType === 'ci'

  function getOnStageClick(stageId: string) {
    return (e: React.MouseEvent<HTMLDivElement>): void => {
      e.stopPropagation()
      e.preventDefault()
      const path = routes.toExecutionPipelineView({
        accountId,
        module,
        orgIdentifier,
        pipelineIdentifier,
        projectIdentifier,
        executionIdentifier: planExecutionId
      })

      if (!isExecutionNotStarted(status)) {
        history.push(`${path}?stage=${stageId}`)
      }
    }
  }

  return (
    <Popover
      position="top"
      {...rest}
      className={cx(css.stageWrapper, css[statusLower as keyof typeof css])}
      targetClassName={css.stage}
      targetTagName="div"
      wrapperTagName="div"
      targetProps={{ onClick: getOnStageClick(stage.nodeUuid || '') }}
      interactionKind="hover"
    >
      {stage.status === 'Running' ? (
        <RunningIcon />
      ) : (
        <Icon name={IconMap[stage.status as ExecutionStatus]} size={13} className={css.icon} />
      )}
      <div className={css.infoPopover}>
        <div className={css.title}>{stage.nodeIdentifier}</div>
        <ExecutionStatusLabel status={stage.status} />
        {stage?.startTs && (
          <Duration
            padding={{ left: 'small' }}
            durationText=" "
            icon="time"
            iconProps={{ size: 12 }}
            startTime={stage?.startTs}
            endTime={stage?.endTs}
          />
        )}
        {HAS_CD ? (
          <div className={css.section}>
            <String tagName="div" className={css.sectionTitle} stringID="services" />
            <div className={css.sectionData}>{get(stage.moduleInfo, 'cd.serviceInfo.displayName', '-')}</div>
            <String tagName="div" className={css.sectionTitle} stringID="artifacts" />
            <div className={css.sectionData}>
              {moduleInfo?.cd?.serviceInfo?.artifacts?.primary ? (
                <String
                  tagName="div"
                  stringID="artifactDisplay"
                  useRichText
                  vars={{
                    image: moduleInfo.cd.serviceInfo.artifacts.primary.imagePath,
                    tag: moduleInfo.cd.serviceInfo.artifacts.primary.tag
                  }}
                />
              ) : (
                <div>-</div>
              )}
              {(get(stage.moduleInfo, 'cd.serviceInfo.artifacts.sidecars', []) as Array<Record<string, string>>).map(
                (row, i) => (
                  <String
                    key={i}
                    tagName="div"
                    stringID="artifactDisplay"
                    useRichText
                    vars={{
                      image: row.imagePath,
                      tag: row.tag
                    }}
                  />
                )
              )}
            </div>
            <String tagName="div" className={css.sectionTitle} stringID="environments" />
            <div className={css.sectionData}>{get(stage.moduleInfo, 'cd.infraExecutionSummary.name', '-')}</div>
          </div>
        ) : null}
        {HAS_CI ? <div></div> : null}
      </div>
    </Popover>
  )
}

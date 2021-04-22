import React from 'react'
import moment from 'moment'
import { partition } from 'lodash-es'

import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'
import { useStrings, String } from 'framework/exports'
import { Collapse } from '../Common/Collapse/Collapse'

import css from './PipelineDetailsTab.module.scss'

export function PipelineDetailsTab(): React.ReactElement {
  const { pipelineStagesMap, queryParams } = useExecutionContext()
  const { getString } = useStrings()

  const [completedStages, upcomingStages] = partition([...pipelineStagesMap.values()], stage =>
    isExecutionComplete(stage.status)
  )
  const filteredCompletedStages = completedStages.reverse().filter(stage => queryParams.stage !== stage.nodeUuid)
  const filteredUpcomingStages = upcomingStages.filter(stage => queryParams.stage !== stage.nodeUuid)

  return (
    <div className={css.main}>
      <div className={css.upcoming}>
        <String stringID="pipeline.execution.upcomingStagesPrefix" />
        {filteredUpcomingStages.length > 0 ? (
          <span>{filteredUpcomingStages.map(stage => stage.name).join(', ')}</span>
        ) : (
          <String stringID="common.none" />
        )}
      </div>
      <String tagName="div" className={css.title} stringID="pipeline.execution.stagesExecuted" />
      {filteredCompletedStages.length > 0 ? (
        filteredCompletedStages.map(stage => (
          <div key={stage.nodeUuid}>
            <Collapse
              titleContentClassName={css.summary}
              titleClassName={css.collapseTitle}
              title={
                <React.Fragment>
                  <div>{`${getString('pipeline.execution.stageTitlePrefix')} ${stage.name}`}</div>
                  <div>
                    {stage.endTs
                      ? `${getString('pipeline.execution.timePrefix')}${moment(stage.endTs).fromNow()}`
                      : /* istanbul ignore next */ null}
                  </div>
                </React.Fragment>
              }
              isDefaultOpen
            >
              {stage.moduleInfo?.cd ? (
                <div className={css.stageInfo}>
                  <div>
                    <String className={css.heading} tagName="div" stringID="serviceOrServices" />
                    <div>{stage.moduleInfo.cd.serviceInfo?.displayName}</div>
                  </div>
                  <div>
                    <String className={css.heading} tagName="div" stringID="artifactOrArtifacts" />
                    <div>
                      {[
                        stage.moduleInfo.cd.serviceInfo.artifacts?.primary
                          ? getString('artifactDisplay', {
                              image: stage.moduleInfo.cd.serviceInfo.artifacts.primary.imagePath,
                              tag: stage.moduleInfo.cd.serviceInfo.artifacts.primary.tag
                            })
                          : '',
                        ...(stage.moduleInfo.cd.serviceInfo.artifacts?.sidecars || /* istanbul ignore next */ []).map(
                          (artifact: any) =>
                            getString('artifactDisplay', {
                              image: artifact.imagePath,
                              tag: artifact.tag
                            })
                        )
                      ]
                        .filter(str => str)
                        .map((str, i) => (
                          <div key={i}>{str}</div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <String className={css.heading} tagName="div" stringID="environmentOrEnvironments" />
                    <div>{stage.moduleInfo.cd.infraExecutionSummary?.name}</div>
                  </div>
                </div>
              ) : /* istanbul ignore next */ null}
            </Collapse>
          </div>
        ))
      ) : (
        <String stringID="common.none" />
      )}
    </div>
  )
}

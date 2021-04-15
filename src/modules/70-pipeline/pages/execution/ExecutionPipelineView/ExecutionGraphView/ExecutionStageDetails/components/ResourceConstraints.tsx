import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import { Text } from '@wings-software/uicore'
import { String, useStrings } from 'framework/exports'
import type { ResourceConstraintExecutionInfo } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import css from './components.module.scss'
export interface ResourceConstraintTooltipProps {
  loading: boolean
  data?: {
    executionList?: ResourceConstraintExecutionInfo[]
    executionId: string
  }
}
const getnoOfExecutionsBeforePipeline = (
  executionList: ResourceConstraintExecutionInfo[] = [],
  executionId?: string
): number => {
  let noOfExecutionsBeforePipeline = 0
  for (let index = 0; index < executionList.length; index++) {
    if (executionList[index].planExecutionId === executionId) {
      break
    }
    noOfExecutionsBeforePipeline++
  }
  return noOfExecutionsBeforePipeline
}
export default function ResourceConstraintTooltip(props: ResourceConstraintTooltipProps): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams()
  const { getString } = useStrings()
  const noOfExecutionsBeforePipeline = getnoOfExecutionsBeforePipeline(
    props?.data?.executionList,
    props.data?.executionId
  )
  return props.loading ? (
    <div className={css.spinner}>
      <Spinner size={40} />
    </div>
  ) : (
    <div className={css.resourceConstraints}>
      {props?.data?.executionList?.length && (
        <div className={css.infoArea}>
          <div className={css.infoText}>
            <String
              stringID={'pipeline.resourceConstraints.infoText'}
              vars={{
                executioncount: noOfExecutionsBeforePipeline
              }}
            />
          </div>
          <div className={css.pipelineList}>
            {props?.data?.executionList?.map((pipeline: ResourceConstraintExecutionInfo) => (
              <div className={css.pipelineListItem} key={pipeline.pipelineIdentifier}>
                <Link
                  to={routes.toExecutionPipelineView({
                    pipelineIdentifier: pipeline.pipelineIdentifier || '',
                    projectIdentifier,
                    orgIdentifier,
                    module,
                    accountId,
                    executionIdentifier: pipeline?.planExecutionId || ''
                  })}
                >
                  <Text className={css.pipelineId} title={pipeline.pipelineIdentifier} width={200} lineClamp={1}>
                    {pipeline.pipelineIdentifier}
                  </Text>

                  <Text className={css.executionStatus}>
                    {pipeline.planExecutionId === props.data?.executionId &&
                      pipeline.state !== 'ACTIVE' &&
                      getString('pipeline.resourceConstraints.yourPipeline')}
                    {pipeline.state === 'ACTIVE' && getString('pipeline.resourceConstraints.currentlyExecuting')}
                  </Text>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

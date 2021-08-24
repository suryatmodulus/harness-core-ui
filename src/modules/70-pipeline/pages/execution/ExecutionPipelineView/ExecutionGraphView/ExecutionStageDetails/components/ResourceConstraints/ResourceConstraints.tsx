import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ResourceConstraintDetail } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface ResourceConstraintTooltipProps {
  loading: boolean
  data?: {
    executionList?: ResourceConstraintDetail[]
    executionId: string
  }
}

const getnoOfExecutionsBeforePipeline = (
  executionList: ResourceConstraintDetail[] = [],
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
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const noOfExecutionsBeforePipeline = getnoOfExecutionsBeforePipeline(
    props?.data?.executionList,
    props.data?.executionId
  )

  return props.loading ? (
    <Container border={{ top: true, width: 1, color: Color.GREY_100 }} padding={'medium'}>
      <Spinner size={24} />
    </Container>
  ) : (
    <Container padding={'medium'} border={{ top: true, width: 1, color: Color.GREY_100 }}>
      {props?.data?.executionList?.length && (
        <Layout.Vertical spacing={'small'}>
          <Text font={{ size: 'small' }}>
            {getString('pipeline.resourceConstraints.infoText', { executioncount: noOfExecutionsBeforePipeline })}
          </Text>
          {props?.data?.executionList?.map((pipeline: ResourceConstraintDetail, index: number) => (
            <Container key={`${pipeline.pipelineIdentifier}-${index}`}>
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
                <Layout.Horizontal>
                  <Text
                    title={pipeline.pipelineIdentifier}
                    width={200}
                    lineClamp={1}
                    inline={true}
                    font={{ size: 'small' }}
                    color={Color.BLUE_500}
                  >
                    {pipeline.pipelineIdentifier}
                  </Text>
                  <Text inline={true} color={Color.BLUE_500} font={{ size: 'small' }}>
                    {pipeline.planExecutionId === props.data?.executionId &&
                      pipeline.state !== 'ACTIVE' &&
                      getString('pipeline.resourceConstraints.yourPipeline')}
                    {pipeline.state === 'ACTIVE' && getString('pipeline.resourceConstraints.currentlyExecuting')}
                  </Text>
                </Layout.Horizontal>
              </Link>
            </Container>
          ))}
        </Layout.Vertical>
      )}
    </Container>
  )
}

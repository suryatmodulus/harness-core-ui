import React from 'react'
import cx from 'classnames'
import { Icon, Container, Layout } from '@wings-software/uicore'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import { CommitsInfo } from '@ci/components/CommitsInfo/CommitsInfo'
import { getUIType, UIType } from '../common/getUIType'

import css from './CIExecutionCardSummary.module.scss'

const RepoBranch = ({ repo, branch }: { repo: string; branch: string }): React.ReactElement => (
  <div className={cx(css.label, css.multiple, css.alignSelfStart)}>
    <Container flex>
      <Icon name="repository" size={14} color="primary7" />
      <div>{repo}</div>
    </Container>
    <Container flex>
      <Icon name="git-new-branch" size={12} color="primary7" />
      <div>{branch}</div>
    </Container>
  </div>
)

function getUIByType(uiType: UIType, { data }: { data: ExecutionSummaryProps['data'] }): React.ReactElement {
  let ui

  switch (uiType) {
    case UIType.Branch:
      ui = (
        <>
          <RepoBranch repo={data.repoName} branch={data.branch} />
          {data?.ciExecutionInfoDTO?.branch?.commits && (
            <CommitsInfo commits={data?.ciExecutionInfoDTO?.branch?.commits} />
          )}
        </>
      )
      break
    case UIType.Tag:
      ui = (
        <>
          <Layout.Horizontal className={css.alignSelfStart} flex spacing="small">
            <div className={css.label}>
              <Icon name="repository" size={14} color="primary7" />
              <div>{data.repoName}</div>
            </div>
            <div className={css.label}>
              <Icon name="tag" size={14} color="primary7" />
              <div>{data.tag}</div>
            </div>
            {/* <Text tooltip={<Container padding="small"> Notes</Container>}>
            <Icon name="more" size={14} />
          </Text> */}
          </Layout.Horizontal>
          {data?.ciExecutionInfoDTO?.branch?.commits && (
            <CommitsInfo commits={data?.ciExecutionInfoDTO?.branch?.commits} />
          )}
        </>
      )
      break
    case UIType.PullRequest:
      ui = (
        <>
          <Layout.Horizontal className={css.alignSelfStart} flex spacing="small">
            <RepoBranch repo={data.repoName} branch={data?.ciExecutionInfoDTO?.pullRequest?.sourceBranch} />
            {data?.ciExecutionInfoDTO?.pullRequest?.targetBranch && (
              <>
                <Icon name="arrow-right" size={14} />
                <Container className={css.label}>
                  <Icon name="git-new-branch" size={12} color="primary7" />
                  <div>{data?.ciExecutionInfoDTO?.pullRequest?.targetBranch}</div>
                </Container>
              </>
            )}
          </Layout.Horizontal>
          {data?.ciExecutionInfoDTO?.pullRequest?.commits && (
            <CommitsInfo commits={data?.ciExecutionInfoDTO?.pullRequest?.commits} />
          )}
        </>
      )
      break
  }

  return ui
}

export function CIExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { data } = props

  const uiType = getUIType(data)
  if (!uiType) {
    return <></>
  }

  const ui = getUIByType(uiType, { data })
  if (!ui) {
    return <></>
  }

  return <div className={css.main}>{ui}</div>
}

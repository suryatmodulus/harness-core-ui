import React from 'react'
import cx from 'classnames'
import { Icon, Container, Layout, Text } from '@wings-software/uicore'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import { CommitsInfo } from '@ci/components/CommitsInfo/CommitsInfo'
import { useStrings, UseStringsReturn } from 'framework/strings'
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

function getUIByType(
  uiType: UIType,
  { data, getString }: { data: ExecutionSummaryProps['data']; getString: UseStringsReturn['getString'] }
): React.ReactElement {
  let ui

  const handleLinkClick = (event: any): void => {
    event.stopPropagation()
    window.open(event.target.href, '_blank')
  }

  switch (uiType) {
    case UIType.Branch:
      ui = (
        <>
          <RepoBranch repo={data.repoName} branch={data.branch} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.branch?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
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
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.branch?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
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
          <Layout.Horizontal className={css.alignSelfStart} flex spacing="small">
            <Icon name="git-pull" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                color="grey900"
                style={{ maxWidth: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                tooltip={<Container padding="small">{data?.ciExecutionInfoDTO?.pullRequest?.title}</Container>}
              >
                {data?.ciExecutionInfoDTO?.pullRequest?.title}
              </Text>
            </div>
            <a
              className={css.label}
              href={data?.ciExecutionInfoDTO?.pullRequest?.link || ''}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              {getString('ci.prSymbol')}
              {typeof data?.ciExecutionInfoDTO?.pullRequest?.id === 'string' ||
              typeof data?.ciExecutionInfoDTO?.pullRequest?.id === 'number'
                ? data?.ciExecutionInfoDTO?.pullRequest?.id
                : data?.ciExecutionInfoDTO?.pullRequest?.id?.['$numberLong']
                ? data?.ciExecutionInfoDTO?.pullRequest?.id?.['$numberLong']
                : ''}
            </a>
            <div className={css.state}>{data?.ciExecutionInfoDTO?.pullRequest?.state}</div>
          </Layout.Horizontal>
          {data?.ciExecutionInfoDTO?.pullRequest?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.pullRequest?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
          )}
        </>
      )
      break
  }

  return ui
}

export function CIExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { getString } = useStrings()

  const { data } = props
  if (!data) {
    return <></>
  }

  const uiType = getUIType(data)
  if (!uiType) {
    return <></>
  }

  const ui = getUIByType(uiType, { data, getString })
  if (!ui) {
    return <></>
  }

  return <div className={css.main}>{ui}</div>
}

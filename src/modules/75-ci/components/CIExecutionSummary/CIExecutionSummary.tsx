import React from 'react'
import cx from 'classnames'
import { Text, Icon, Container, Layout } from '@wings-software/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import { getUIType, UIType } from '../common/getUIType'
import { CommitId } from '../CommitsInfo/CommitsInfo'
import css from './CIExecutionSummary.module.scss'

const RepoBranch = ({ repo, branch }: { repo: string; branch: string }): React.ReactElement => (
  <div className={cx(css.label, css.multiple)}>
    <Container flex>
      <Icon name="repository" size={14} color="primary7" />
      <Text
        className={css.truncated}
        tooltip={
          <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
            {repo}
          </Container>
        }
      >
        {repo}
      </Text>
    </Container>
    <Container flex>
      <Icon name="git-new-branch" size={12} color="primary7" />
      <Text
        className={css.truncated}
        tooltip={
          <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
            {branch}
          </Container>
        }
      >
        {branch}
      </Text>
    </Container>
  </div>
)

function getUIByType(
  uiType: UIType,
  { data, getString }: { data: ExecutionSummaryProps['data']; getString: UseStringsReturn['getString'] }
): React.ReactElement {
  let ui

  switch (uiType) {
    case UIType.Branch:
      ui = (
        <>
          <RepoBranch repo={data.repoName} branch={data.branch} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
              <Icon name="git-branch-existing" size={14} />
              <div style={{ fontSize: 0 }}>
                <Text
                  font={{ size: 'small' }}
                  style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  tooltip={
                    <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                      {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                    </Container>
                  }
                >
                  {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                </Text>
              </div>
              {data?.ciExecutionInfoDTO?.branch?.commits[0]?.id && (
                <CommitId
                  commitId={data?.ciExecutionInfoDTO?.branch?.commits[0]?.id}
                  commitLink={data?.ciExecutionInfoDTO?.branch?.commits[0]?.link}
                />
              )}
            </Layout.Horizontal>
          )}
        </>
      )
      break
    case UIType.Tag:
      ui = (
        <Layout.Horizontal flex spacing="small">
          <div className={css.label}>
            <Icon name="repository" size={14} color="primary7" />
            <div className={css.truncated}>{data.repoName}</div>
          </div>
          <div className={css.label}>
            <Icon name="tag" size={14} color="primary7" />
            <Text
              className={css.truncated}
              tooltip={
                <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                  {data.tag}
                </Container>
              }
            >
              {data.tag}
            </Text>
          </div>
          {/* <Text tooltip={<Container padding="small"> Notes</Container>}>
            <Icon name="more" size={14} />
          </Text> */}
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <Layout.Horizontal flex spacing="small">
              <Icon name="git-branch-existing" size={14} />
              <div style={{ fontSize: 0 }}>
                <Text
                  font={{ size: 'small' }}
                  style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  tooltip={
                    <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                      {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                    </Container>
                  }
                >
                  {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                </Text>
              </div>
              {data?.ciExecutionInfoDTO?.branch?.commits[0]?.id && (
                <CommitId
                  commitId={data?.ciExecutionInfoDTO?.branch?.commits[0]?.id}
                  commitLink={data?.ciExecutionInfoDTO?.branch?.commits[0]?.link}
                />
              )}
            </Layout.Horizontal>
          )}
        </Layout.Horizontal>
      )
      break
    case UIType.PullRequest:
      ui = (
        <>
          <RepoBranch repo={data.repoName} branch={data?.ciExecutionInfoDTO?.pullRequest?.sourceBranch} />
          {data?.ciExecutionInfoDTO?.pullRequest?.targetBranch && (
            <>
              <Icon name="arrow-right" size={14} />
              <Container className={css.label}>
                <Icon name="git-new-branch" size={12} color="primary7" />
                <Text
                  className={css.truncated}
                  tooltip={
                    <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                      {data?.ciExecutionInfoDTO?.pullRequest?.targetBranch}
                    </Container>
                  }
                >
                  {data?.ciExecutionInfoDTO?.pullRequest?.targetBranch}
                </Text>
              </Container>
            </>
          )}
          {data?.ciExecutionInfoDTO?.pullRequest && (
            <>
              {data?.ciExecutionInfoDTO?.pullRequest?.commits?.length > 0 && (
                <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
                  <Icon name="git-branch-existing" size={14} />
                  <div style={{ fontSize: 0 }}>
                    <Text
                      font={{ size: 'small' }}
                      style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                      tooltip={
                        <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                          {data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.message}
                        </Container>
                      }
                    >
                      {data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.message}
                    </Text>
                  </div>
                  {data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.id && (
                    <CommitId
                      commitId={data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.id}
                      commitLink={data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.link}
                    />
                  )}
                </Layout.Horizontal>
              )}
              <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
                <Icon name="git-pull" size={14} />
                <div style={{ fontSize: 0 }}>
                  <Text
                    font={{ size: 'small' }}
                    style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
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
            </>
          )}
        </>
      )
      break
  }

  return ui
}

export const CIExecutionSummary = ({ data }: ExecutionSummaryProps): React.ReactElement => {
  const { getString } = useStrings()

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

  return (
    <div className={cx(css.main, { [css.pullRequest]: uiType === UIType.PullRequest })}>
      <Icon className={css.icon} size={18} name="ci-main" />
      {ui}
    </div>
  )
}

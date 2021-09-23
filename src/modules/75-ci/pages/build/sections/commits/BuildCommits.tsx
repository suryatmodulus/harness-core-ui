import React from 'react'
import copy from 'copy-to-clipboard'
import moment from 'moment'
import { get } from 'lodash-es'
import { Card, Container, Text, Icon, Avatar, Color, Accordion } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { getShortCommitId, getTimeAgo } from '@ci/services/CIUtils'
import type { CIBuildCommit, CIWebhookInfoDTO, CIPipelineModuleInfo } from 'services/ci'
import { useStrings } from 'framework/strings'
import css from './BuildCommits.module.scss'

interface CommitsGroupedByTimestamp {
  timeStamp: number
  commits: CIBuildCommit[]
}

// NOTE: colors here are closest
// match to provided in mockup.
// Can be switched once mockup one's
// will made it to uikit
const AVATAR_COLORS = [
  Color.BLUE_700,
  Color.SEA_GREEN_500,
  Color.ORANGE_500,
  Color.PURPLE_900,
  Color.GREEN_800,
  Color.RED_600
]

const Commits: React.FC<{ commits: CIBuildCommit[] }> = ({ commits }): any => {
  const context = useExecutionContext()

  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const copy2Clipboard = (text: string): void => {
    copy(String(text))
      ? showSuccess(getString('ci.clipboardCopySuccess'))
      : showError(getString('ci.clipboardCopyFail'), undefined, 'ci.copy.commit.error')
  }

  const ciData = get(
    context,
    'pipelineExecutionDetail.pipelineExecutionSummary.moduleInfo.ci.ciExecutionInfoDTO'
  ) as CIWebhookInfoDTO
  const commitAuthor = ciData?.author

  return commits.map(({ id = '', message = '', timeStamp: commitTimestamp = 0, ownerId, ownerName }, index) => {
    const [title, description] = message.split('\n\n')
    // we should use only first part of a name
    // in order to show a single letter
    const firstName = (ownerName || commitAuthor!.name)?.split(' ')[0]
    return (
      <Card className={css.commit} key={id}>
        <div>
          <Text className={css.commitTitle} font="small">
            {title}
          </Text>
          {description && (
            <Text className={css.commitDescription} font="small" margin={{ top: 'xsmall' }}>
              {description}
            </Text>
          )}
        </div>
        <Container flex>
          <Avatar
            className={css.avatar}
            name={firstName}
            size={'xsmall'}
            backgroundColor={AVATAR_COLORS[index % AVATAR_COLORS.length]}
            src={commitAuthor?.avatar}
            hoverCard={false}
          />
          <Text className={css.committed} font="xsmall" margin={{ right: 'xlarge' }}>
            {ownerId || commitAuthor!.id} {getString('ci.committed')} {getTimeAgo(commitTimestamp)}
          </Text>
          <button className={css.hash} onClick={() => copy2Clipboard(id)}>
            <Text
              className={css.hashText}
              font={{ size: 'xsmall', weight: 'semi-bold' }}
              padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
              margin={{ right: 'small' }}
            >
              {getShortCommitId(id)}
            </Text>
            <Icon className={css.hashIcon} name="clipboard" size={14} margin={{ right: 'small' }} />
          </button>
        </Container>
      </Card>
    )
  })
}

const CommitsGroupedByTimestamp: React.FC<{ commitsGroupedByTimestamp: CommitsGroupedByTimestamp[] }> = ({
  commitsGroupedByTimestamp
}): any => {
  const { getString } = useStrings()

  return commitsGroupedByTimestamp.map(({ timeStamp, commits }) => (
    <div className={css.stack} key={String(timeStamp)}>
      <div className={css.stackHeader}>
        <Icon className={css.stackHeaderIcon} name="git-commit" size={20} margin={{ right: 'medium' }} />
        <Text className={css.stackHeaderText} font="small">
          {getString('ci.commitsOn')} {moment(timeStamp).format('MMM D, YYYY')}
        </Text>
      </div>
      <Commits commits={commits} />
    </div>
  ))
}

const BuildCommits: React.FC = () => {
  const context = useExecutionContext()

  const ciData = get(context, 'pipelineExecutionDetail.pipelineExecutionSummary.moduleInfo.ci') as CIPipelineModuleInfo

  const codebaseCommits = ciData?.ciExecutionInfoDTO?.branch?.commits?.length
    ? ciData.ciExecutionInfoDTO.branch.commits
    : ciData?.ciExecutionInfoDTO?.pullRequest?.commits
  const triggerCommits = ciData?.ciExecutionInfoDTO?.branch?.triggerCommits?.length
    ? ciData.ciExecutionInfoDTO.branch.triggerCommits
    : ciData?.ciExecutionInfoDTO?.pullRequest?.triggerCommits

  const codebaseCommitsGroupedByTimestamp: CommitsGroupedByTimestamp[] = []
  codebaseCommits?.forEach((commit: CIBuildCommit) => {
    const index = codebaseCommitsGroupedByTimestamp.findIndex(({ timeStamp: timestamp2 }) =>
      moment(commit.timeStamp).isSame(timestamp2, 'day')
    )

    if (index > -1) {
      codebaseCommitsGroupedByTimestamp[index].commits.push(commit)
    } else {
      codebaseCommitsGroupedByTimestamp.push({ timeStamp: commit.timeStamp || 0, commits: [commit] })
    }
  })

  const triggerCommitsGroupedByTimestamp: CommitsGroupedByTimestamp[] = []
  triggerCommits?.forEach((commit: CIBuildCommit) => {
    const index = triggerCommitsGroupedByTimestamp.findIndex(({ timeStamp: timestamp2 }) =>
      moment(commit.timeStamp).isSame(timestamp2, 'day')
    )

    if (index > -1) {
      triggerCommitsGroupedByTimestamp[index].commits.push(commit)
    } else {
      triggerCommitsGroupedByTimestamp.push({ timeStamp: commit.timeStamp || 0, commits: [commit] })
    }
  })

  return (
    <div className={css.wrapper}>
      {triggerCommits?.length > 0 ? (
        <>
          <Accordion activeId="codebase-commits">
            <Accordion.Panel
              id="codebase-commits"
              summary={`${ciData?.repoName} (Codebase)`}
              details={<CommitsGroupedByTimestamp commitsGroupedByTimestamp={codebaseCommitsGroupedByTimestamp} />}
            />
          </Accordion>

          <Accordion activeId="trigger-commits">
            <Accordion.Panel
              id="trigger-commits"
              summary={`${ciData?.triggerRepoName} (Trigger)`}
              details={<CommitsGroupedByTimestamp commitsGroupedByTimestamp={triggerCommitsGroupedByTimestamp} />}
            />
          </Accordion>
        </>
      ) : (
        <CommitsGroupedByTimestamp commitsGroupedByTimestamp={codebaseCommitsGroupedByTimestamp} />
      )}
    </div>
  )
}

export default BuildCommits

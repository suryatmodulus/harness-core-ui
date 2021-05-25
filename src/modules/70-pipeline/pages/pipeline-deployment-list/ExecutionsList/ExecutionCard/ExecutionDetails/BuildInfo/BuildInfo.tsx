import React from 'react'
import cx from 'classnames'
import { first } from 'lodash-es'
import { Color, Icon, Link, Text } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import BuildBranchBadge from '@pipeline/components/badges/BuildBranchBadge/BuildBranchBadge'
import BuildPullRequestBadge from '@pipeline/components/badges/BuildPullRequestBadge/BuildPullRequestBadge'
import type { CIBuildResponseDTO } from '../Types/types'
import css from './BuildInfo.module.scss'

export interface BuildInfoProps {
  buildData: CIBuildResponseDTO
  branchName: string
  showCommits: boolean
  toggleCommits: () => void
  className?: string
}

const BuildInfo: React.FC<BuildInfoProps> = props => {
  const { buildData, branchName, showCommits, toggleCommits, className } = props

  const { getString } = useStrings()

  let sourceInfo

  switch (buildData?.event) {
    case 'branch': {
      const lastCommit = first(buildData?.branch?.commits)
      sourceInfo = (
        <>
          <BuildBranchBadge
            branchName={buildData?.branch?.name}
            commitId={lastCommit?.id?.slice(0, 7)}
            className={css.gitInfo1}
          />

          {lastCommit ? (
            <div className={css.gitInfo2}>
              <String stringID="execution.latestCommit" color={Color.GREY_500} />
              <Text className={cx(css.ellipsis, css.commitOrPrTitle)}>{lastCommit?.message}</Text>
              <Link tooltip={lastCommit?.message} withoutHref>
                <span className={css.moreBox}>
                  <Icon color={Color.GREY_500} name="more" size={10} />
                </span>
              </Link>
              <Link withoutHref onClick={toggleCommits}>
                <Icon color={Color.GREY_500} name={showCommits ? 'main-chevron-up' : 'main-chevron-down'} size={14} />
              </Link>
            </div>
          ) : null}
        </>
      )
      break
    }

    case 'pullRequest': {
      const lastCommit = first(buildData?.pullRequest?.commits)
      sourceInfo = (
        <>
          <BuildPullRequestBadge
            sourceRepo={buildData?.pullRequest?.sourceRepo}
            sourceBranch={buildData?.pullRequest?.sourceBranch}
            targetBranch={buildData?.pullRequest?.targetBranch}
            className={css.gitInfo1}
          />

          <div className={css.gitInfo2}>
            <Text className={cx(css.ellipsis, css.commitOrPrTitle)}>{buildData?.pullRequest?.title}</Text>
            <Link tooltip={buildData?.pullRequest?.title} withoutHref>
              <span className={css.moreBox}>
                <Icon color={Color.GREY_500} name="more" size={10} />
              </span>
            </Link>
            <Link className={css.prNumber} href={buildData?.pullRequest?.link} target="_blank">
              {getString('execution.prSymbol')}{' '}
              {typeof buildData?.pullRequest?.id === 'string' || typeof buildData?.pullRequest?.id === 'number'
                ? buildData?.pullRequest?.id
                : buildData?.pullRequest?.id?.['$numberLong']
                ? buildData?.pullRequest?.id?.['$numberLong']
                : ''}
            </Link>
            <span className={css.pullRequestStatus}>{buildData?.pullRequest?.state}</span>
            {lastCommit ? (
              <Link withoutHref onClick={toggleCommits}>
                <Icon color={Color.GREY_500} name={showCommits ? 'main-chevron-up' : 'main-chevron-down'} size={14} />
              </Link>
            ) : null}
          </div>
        </>
      )
      break
    }

    // NOTE: if no other data is available we are showing only branch name
    default: {
      sourceInfo = <BuildBranchBadge branchName={branchName} className={css.gitInfo1} />
      break
    }
  }

  function killEvent(e: React.MouseEvent<HTMLDivElement>): void {
    e.stopPropagation()
  }

  return (
    <div className={className} onClick={killEvent}>
      {sourceInfo}
    </div>
  )
}

export default BuildInfo

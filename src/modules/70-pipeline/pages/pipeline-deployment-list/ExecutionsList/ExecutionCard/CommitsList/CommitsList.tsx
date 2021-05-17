import React from 'react'
import copy from 'copy-to-clipboard'
import { Avatar, Color, Icon, Text } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import type { CIBuildCommit, CIBuildAuthor } from 'services/ci'
import { useToaster } from '@common/exports'

import css from './CommitsList.module.scss'

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

export interface CommitsListProps {
  commits: CIBuildCommit[]
  author?: CIBuildAuthor
}

export const CommitsList: React.FC<CommitsListProps> = props => {
  const { commits, author } = props

  const commitsToShow = commits.slice(0, 5)

  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()

  const copy2Clipboard = (text: string): void => {
    copy(`${text}`) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }

  // NOTE: absolute positioning requires explicit height to be set on parent
  const commitsHeight = commitsToShow.length * 38 + 20

  function killEvent(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={css.commitsOuter} style={{ height: `${commitsHeight}px` }} onClick={killEvent}>
      <div className={css.commitsInner}>
        <String className={css.commitsHeader} stringID="execution.latest5Commits" />
        <div className={css.commitsHolder}>
          {commitsToShow.map((commit, index) => (
            <div className={css.commitItem} key={commit.id}>
              <div className={css.commitMessage}>{commit.message}</div>
              <div>
                {/* @TODO: once response includes avatar reference,
                 * we should pass it to Avatar component
                 */}
                <Avatar
                  className={css.avatar}
                  name={commit.ownerName?.split(' ')[0]}
                  src={author?.avatar}
                  size={'xsmall'}
                  backgroundColor={AVATAR_COLORS[index % AVATAR_COLORS.length]}
                />
                <Text inline margin={{ left: 'small' }} color={Color.GREY_900}>
                  {commit.ownerId}
                </Text>
                <div className={css.commitHash} onClick={() => copy2Clipboard(commit.id as string)}>
                  <Icon size={12} name="clipboard" color={Color.GREY_500} />
                  <Text inline>{commit?.id?.slice(0, 7)}</Text>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={css.commitsFooter}></div>
      </div>
    </div>
  )
}

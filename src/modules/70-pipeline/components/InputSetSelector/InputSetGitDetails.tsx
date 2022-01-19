import React from 'react'
import { Color, Icon, Layout, Text } from '@harness/uicore'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import css from './InputSetSelector.module.scss'

export function InputSetGitDetails(props: { gitDetails: GitQueryParams }): JSX.Element {
  const { gitDetails } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  return (
    <Layout.Vertical margin={{ left: 'xsmall' }} spacing="small" className={css.inputSetGitDetails}>
      <Layout.Horizontal spacing="xsmall">
        <Icon name="repository" size={12}></Icon>
        <Text
          font={{ size: 'small', weight: 'light' }}
          color={Color.GREY_450}
          title={gitDetails?.repoIdentifier}
          lineClamp={1}
        >
          {(!loadingRepos && getRepoDetailsByIndentifier(gitDetails?.repoIdentifier, gitSyncRepos)?.name) || ''}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="xsmall">
        <Icon size={12} name="git-new-branch"></Icon>
        <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_450} title={gitDetails?.branch} lineClamp={1}>
          {gitDetails?.branch || ''}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

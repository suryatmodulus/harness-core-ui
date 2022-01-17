/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { Text, Color, Container, Icon, Layout } from '@wings-software/uicore'

import BranchSettingsButton from './BranchSettingsButton'
import css from './GitSyncActions.module.scss'

export interface GitSyncActionsProps {
  isLoading: boolean
  branch: string
  repository: string
  isAutoCommitEnabled: boolean
  isGitSyncPaused: boolean
  handleToggleAutoCommit: (newAutoCommitValue: boolean) => Promise<void>
  handleGitPause: (newGitPauseValue: boolean) => Promise<void>
}

const GitSyncActions = (props: GitSyncActionsProps): ReactElement => {
  const { repository } = props

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <Layout.Horizontal spacing="small" width={400}>
      <Container className={css.gitRepoText}>
        <Icon name="repository" />
        <Text lineClamp={1} color={Color.BLACK}>
          {repository}
        </Text>
      </Container>

      <Container>
        <BranchSettingsButton isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} {...props} />
      </Container>
    </Layout.Horizontal>
  )
}

export default GitSyncActions

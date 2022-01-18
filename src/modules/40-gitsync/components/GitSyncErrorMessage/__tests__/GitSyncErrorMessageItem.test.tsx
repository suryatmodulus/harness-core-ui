/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryAllByText, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { GitSyncErrorMessageItem } from '../GitSyncErrorMessageItem'

describe('GitSyncErrorMessageItem', () => {
  test('Fix commit and error reason should be rendered', async () => {
    const errorReason = 'errorReason'
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/setup/git-sync/errors"
        pathParams={{ accountId: 'dummyAccount', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
        defaultAppStoreValues={{
          isGitSyncEnabled: true,
          selectedProject: {
            identifier: 'dummy',
            name: 'dummy',
            modules: ['CD']
          }
        }}
      >
        <GitSyncErrorMessageItem
          fixCommit={'fixCommitId'}
          reason={errorReason}
          title={'src/.harness/filepath.yaml'}
        ></GitSyncErrorMessageItem>
      </TestWrapper>
    )

    const errorReasonElm = queryAllByText(container, errorReason)
    await waitFor(() => expect(errorReasonElm).not.toBeNull())
    expect(errorReasonElm).toHaveLength(1)
    expect(container).toMatchSnapshot()
  })
})

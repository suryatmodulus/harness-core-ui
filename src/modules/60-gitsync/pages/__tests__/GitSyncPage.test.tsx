import React from 'react'
import { render, queryAllByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { GitSyncLandingView } from '../GitSyncPage'
import GitSyncRepoTab from '../repos/GitSyncRepoTab'

const enableText = 'Enable Git Experience'

describe('GitSync Page', () => {
  test('render GitSync page for new user', async () => {
    const disabledProps = {
      children: <GitSyncRepoTab />
    }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync"
        pathParams={{ accountId: 'dummyAccount', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
        defaultAppStoreValues={{
          isGitSyncEnabled: false,
          selectedProject: {
            identifier: 'dummy',
            name: 'dummy',
            modules: ['CI']
          }
        }}
      >
        <GitSyncLandingView {...disabledProps}></GitSyncLandingView>
      </TestWrapper>
    )

    const enabledSearch = queryAllByText(container, enableText)
    expect(enabledSearch).toHaveLength(2)
    expect(container).toMatchSnapshot()
  })
})

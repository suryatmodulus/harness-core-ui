import React from 'react'
import { render, queryAllByText, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import * as gitSyncUtils from '@gitsync/common/gitSyncUtils'
import { GitSyncLandingView } from '../GitSyncPage'
import GitSyncRepoTab from '../repos/GitSyncRepoTab'

const enableText = 'enableGitExperience'

describe('GitSync Page', () => {
  test('render GitSync page for new user with no pipeline created', async () => {
    jest.spyOn(gitSyncUtils, 'canEnableGitExperience').mockImplementation(() => Promise.resolve(true))
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
    await waitFor(() => expect(enabledSearch).not.toBeNull())
    expect(enabledSearch).toHaveLength(2)
    expect(container).toMatchSnapshot()
  })

  test('render GitSync page for new user with pipeline created', async () => {
    jest.spyOn(gitSyncUtils, 'canEnableGitExperience').mockImplementation(() => Promise.resolve(false))
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
    await waitFor(() => expect(enabledSearch).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})

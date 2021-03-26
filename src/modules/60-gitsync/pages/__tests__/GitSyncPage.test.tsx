import React from 'react'
import { render, queryAllByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import GitSyncPage from '../GitSyncPage'
import GitSyncRepoTab from '../repos/GitSyncRepoTab'

const enableText = 'Enable Git Experience'

describe('GitSync Page', () => {
  test('render GitSync page for new user', async () => {
    const disabledProps = {
      mockIsEnabled: {
        data: false,
        loading: false
      },
      children: <GitSyncRepoTab />
    }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync"
        pathParams={{ accountId: 'dummyAccount', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncPage {...disabledProps}></GitSyncPage>
      </TestWrapper>
    )

    const enabledSearch = queryAllByText(container, enableText)
    expect(enabledSearch).toHaveLength(2)
    expect(container).toMatchSnapshot()
  })
})

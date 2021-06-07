import React from 'react'
import { MemoryRouter } from 'react-router'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoFormStep from '../GitSyncRepoFormStep'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Test GitSyncRepoFormStep', () => {
  test('Initial render should match snapshot for GitSyncRepoFormStep', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper
          path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
          pathParams={pathParams}
        >
          <GitSyncRepoFormStep {...pathParams} isEditMode={false} isNewUser={true} gitSyncRepoInfo={undefined} />
        </TestWrapper>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    expect(container).toMatchSnapshot()
  })
})

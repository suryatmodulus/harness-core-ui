import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoFormStep from '../GitSyncRepoFormStep'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Test GitSyncRepoFormStep', () => {
  test('Should not allow saving form if folder name is not specified', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper
          path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
          pathParams={pathParams}
        >
          <GitSyncRepoFormStep {...pathParams} isEditMode={false} isNewUser={false} gitSyncRepoInfo={undefined} />
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
    expect(container.querySelector('[class*="bp3-intent-danger"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('Should have continue button on first step for new user', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <TestWrapper
          path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
          pathParams={pathParams}
        >
          <GitSyncRepoFormStep {...pathParams} isEditMode={false} isNewUser gitSyncRepoInfo={undefined} />
        </TestWrapper>
      </MemoryRouter>
    )
    expect(getByText('continue')).toBeTruthy()
  })
})

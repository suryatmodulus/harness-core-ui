import React from 'react'
import { render, waitFor, act, fireEvent, RenderResult } from '@testing-library/react'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import SaveToGitForm from '../SaveToGitForm'

const createGitSynRepo = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo }))
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Save to git form', () => {
  const setup = (): RenderResult =>
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <SaveToGitForm
          {...pathParams}
          isEditing={false}
          resource={{ type: 'Connectors', name: 'testConnector', identifier: 'testConnector' }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

  test('rendering form to save resouces', async () => {
    const { container, getByText } = setup()
    await waitFor(() => {
      expect(getByText('common.git.saveResourceLabel')).toBeTruthy()
    })

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    expect(container).toMatchSnapshot()
    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]')
    act(() => {
      fireEvent.click(newBranchRadioBtn!)
      expect(container).toMatchSnapshot()
    })
  })
})

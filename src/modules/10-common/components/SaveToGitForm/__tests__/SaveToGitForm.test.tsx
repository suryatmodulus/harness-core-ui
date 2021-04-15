import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import SaveToGitForm from '../SaveToGitForm'

const createGitSynRepo = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => Promise.resolve([]))
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Save to git form', () => {
  test('rendering form to save resouces', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <SaveToGitForm
          {...pathParams}
          isEditing={false}
          resource={{ type: 'Connectors' }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('common.git.saveResourceLabel')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    expect(container).toMatchSnapshot()
  })
})

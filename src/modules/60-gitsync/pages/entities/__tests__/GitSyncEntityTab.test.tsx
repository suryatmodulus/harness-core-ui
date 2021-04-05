import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncEntityTab from '../GitSyncEntityTab'

jest.mock('services/cd-ng', () => ({
  useListGitSyncEntitiesByProduct: jest.fn(() => [])
}))

describe('Git Sync - entity tab', () => {
  test('rendering landing view', async () => {
    const { getAllByText, container } = render(
      <TestWrapper path="/account/:accountId/git-sync/entities" pathParams={{ accountId: 'dummy' }}>
        <GitSyncEntityTab />
      </TestWrapper>
    )

    await waitFor(() => getAllByText('CONTINUOUS DEPLOYMENT'))
    expect(container).toMatchSnapshot()
  })
})

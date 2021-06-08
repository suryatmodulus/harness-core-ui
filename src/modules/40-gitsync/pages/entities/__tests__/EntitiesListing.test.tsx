import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import EntitiesListing from '../EntitiesListing'
import entitiesMockResponse from './mockData/entitiesMockResponse.json'

jest.mock('services/cd-ng', () => ({
  useListGitSyncEntitiesByType: jest.fn(() => entitiesMockResponse)
}))

describe('Git Sync - EntitiesPreview', () => {
  test('render Git Sync EntitiesPreview wrapper', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <EntitiesListing
          backToSummary={noop}
          entityType="Connectors"
          selectedProduct={'CI'}
          gitSyncConfigId=""
          branch="feature"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

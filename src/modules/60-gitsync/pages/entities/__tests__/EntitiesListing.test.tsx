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
      <TestWrapper path="/account/:accountId/git-sync/entities" pathParams={{ accountId: 'dummy' }}>
        <EntitiesListing backToSummary={noop} entityType="Pipelines" selectedProduct={'CD'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import EntitiesListing from '../EntitiesListing'
import entitiesMockResponse from './mockData/connectorEntities.json'

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
        <EntitiesListing backToSummary={noop} entityType="Connectors" gitSyncConfigId="" branch="feature" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

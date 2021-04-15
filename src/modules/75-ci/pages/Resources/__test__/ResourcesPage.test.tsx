import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ResourcesPage from '../ResourcesPage'

describe('ResourcesPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/orgs/:orgIdentifier/test"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy' }}
      >
        <ResourcesPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

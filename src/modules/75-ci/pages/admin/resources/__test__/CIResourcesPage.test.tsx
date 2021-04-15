import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIResourcesPage from '../CIResourcesPage'

describe('CIResourcesPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <CIResourcesPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

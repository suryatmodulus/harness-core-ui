import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PerspectiveGrid, { PerspectiveGridProps } from '../PerspectiveGrid'
import MockResponse from './MockPerspectiveGridResponse.json'

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Perspective Grid', () => {
  test('should be able to render Perspective Grid', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={params}>
        <PerspectiveGrid {...(MockResponse as PerspectiveGridProps)} />
      </TestWrapper>
    )

    expect(getByText('ce.gridColumnSelector')).toBeDefined()
    expect(container.querySelector('[class*="bp3-icon-arrow-down"]')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
})

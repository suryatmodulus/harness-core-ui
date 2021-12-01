import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceCenter } from '@resource-center/components/ResourceCenter/ResourceCenter'
describe('ResourceCenter', () => {
  test('Should render resource center properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

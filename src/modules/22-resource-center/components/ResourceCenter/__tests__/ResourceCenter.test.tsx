import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceCenterHome } from '@resource-center/components/ResourceCenter/ResourceCenter'
describe('ResourceCenter', () => {
  const dummy = jest.fn().mockImplementation()
  test('Should render resource center properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenterHome onClose={dummy} submitTicket={dummy} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

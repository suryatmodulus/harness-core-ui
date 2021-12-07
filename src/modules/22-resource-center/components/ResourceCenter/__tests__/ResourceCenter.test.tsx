import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceCenter, ResourceCenterHome } from '@resource-center/components/ResourceCenter/ResourceCenter'
describe('ResourceCenter', () => {
  const dummy = jest.fn().mockImplementation()
  test('Should render resource center home properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenterHome onClose={dummy} submitTicket={dummy} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render resource center', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

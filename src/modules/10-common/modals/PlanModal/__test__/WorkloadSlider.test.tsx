import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { WorkloadSlider } from '../WorkloadSlider'

const onSelectedMock = jest.fn()
const props = {
  width: 500,
  onSelected: onSelectedMock,
  scale: 200
}
describe('WorkloadSlider', () => {
  describe('Rendering', () => {
    test('should render component properly', () => {
      const { container } = render(
        <TestWrapper>
          <WorkloadSlider {...props} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })
})

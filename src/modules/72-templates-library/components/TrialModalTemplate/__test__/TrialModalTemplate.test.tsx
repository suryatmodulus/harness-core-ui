import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TrialModalTemplate } from '../TrialModalTemplate'

const props = {
  iconName: 'cd-main',
  title: 'Continuous Delivery',
  description: 'Continuous Delivery description',
  imgSrc: '',
  children: <></>
}
describe('Rendering', () => {
  test('should render', () => {
    const { container } = render(
      <TestWrapper>
        <TrialModalTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ErrorsStrip } from '../ErrorsStrip'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

describe('ErrorsStrip', () => {
  test('ErrorsStrip', () => {
    const { container } = render(
      <TestWrapper>
        <ErrorsStrip formErrors={{ name: 'required' }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

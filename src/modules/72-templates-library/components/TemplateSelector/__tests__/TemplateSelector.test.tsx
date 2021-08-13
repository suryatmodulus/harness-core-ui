import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateSelector } from '../TemplateSelector'

describe('<TemplateSelector /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateSelector onSelect={jest.fn()} onClose={jest.fn()} onUseTemplate={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

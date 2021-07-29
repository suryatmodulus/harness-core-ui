import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateDetails } from '../TemplateDetails'

describe('<TemplateDetails /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetails templateIdentifier={'123'} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

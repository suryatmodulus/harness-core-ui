import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateDetailsDrawer } from '../TemplateDetailDrawer'

describe('<TemplateDetailDrawer /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetailsDrawer accountId="account-id" onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

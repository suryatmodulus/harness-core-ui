import React from 'react'
import { render } from '@testing-library/react'
import { ErrorHandler, ErrorHandlerProps } from '@common/components/ErrorHandler/ErrorHandler'
import { TestWrapper } from '@common/utils/testUtils'
import mockError from '@common/components/ErrorHandler/__tests__/ErrorHandler.json'

describe('<ErrorHandler /> tests', () => {
  test('should render ErrorHandler component', async () => {
    const { container } = render(
      <TestWrapper>
        <ErrorHandler responseMessages={mockError as unknown as ErrorHandlerProps['responseMessages']} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

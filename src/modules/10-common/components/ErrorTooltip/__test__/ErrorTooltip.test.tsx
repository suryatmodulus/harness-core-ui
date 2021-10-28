import React from 'react'
import { Icon } from '@wings-software/uicore'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import ErrorTooltip from '../ErrorTooltip'

const errorMessage = 'Something went wrong!'
const onRetry = jest.fn()

describe('ErrorTooltip', () => {
  test('Render default ErrorTooltip', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ErrorTooltip>
          <Icon name="more" />
        </ErrorTooltip>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="more"]')!)

    expect(getByText('common.friendlyMessage: somethingWentWrong')).toBeInTheDocument()

    userEvent.click(queryByText('retry')!)

    expect(onRetry).toBeCalledTimes(0)
  })

  test('Render ErrorTooltip with custom message and onRetry', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <ErrorTooltip message={errorMessage} onRetry={onRetry}>
          <Icon name="more" />
        </ErrorTooltip>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="more"]')!)

    expect(queryByText(`common.friendlyMessage: ${errorMessage}`)).toBeInTheDocument()

    userEvent.click(queryByText('retry')!)

    expect(onRetry).toBeCalledTimes(1)
  })
})

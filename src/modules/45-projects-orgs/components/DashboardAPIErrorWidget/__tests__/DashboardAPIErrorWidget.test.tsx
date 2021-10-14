import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import DashboardAPIErrorWidget from '../DashboardAPIErrorWidget'

const retryCallback = jest.fn()

describe('DashboardAPIErrorWidget', () => {
  test('DashboardAPIErrorWidget rendering', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <DashboardAPIErrorWidget callback={retryCallback} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    expect(queryByText('projectsOrgs.apiError')).toBeInTheDocument()
    expect(queryByText('retry')).toBeInTheDocument()

    userEvent.click(queryByText('retry')!)
    expect(retryCallback).toBeCalledTimes(1)
  })
})

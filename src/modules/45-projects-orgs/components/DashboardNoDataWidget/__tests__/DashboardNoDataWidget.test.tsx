import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DashboardNoDataWidget from '../DashboardNoDataWidget'

describe('DashboardNoDataWidget', () => {
  test('DashboardNoDataWidget rendering', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <DashboardNoDataWidget label={<span>DummyText</span>} getStartedLink="../link" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    expect(queryByText('DummyText')).toBeInTheDocument()
  })
})

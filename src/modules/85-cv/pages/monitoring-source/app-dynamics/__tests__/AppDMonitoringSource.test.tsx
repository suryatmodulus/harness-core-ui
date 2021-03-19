import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import AppDMonitoringSOurce from '../AppDMonitoringSource'

describe('AppDMonitoringSOurce', () => {
  test('render initial state', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: 'loading',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <AppDMonitoringSOurce />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'Select Product'))

    expect(getByText('Map Applications to Harness Environments')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})

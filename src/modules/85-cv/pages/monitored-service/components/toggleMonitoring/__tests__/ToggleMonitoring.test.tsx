import React from 'react'
import { fireEvent, render, waitFor, queryByText } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { useSetHealthMonitoringFlag } from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import ToggleMonitoring from '../ToggleMonitoring'

const params = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  projectIdentifier: 'Demo',
  orgIdentifier: 'default'
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVMonitoringServices({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    ...params
  }
}

jest.mock('services/cv', () => ({
  useSetHealthMonitoringFlag: jest.fn(() => ({ mutate: jest.fn() }))
}))

describe('ToggleMonitoring', () => {
  test('Validate toggle is working', async () => {
    const mutate = jest.fn()
    const refetch = jest.fn()
    ;(useSetHealthMonitoringFlag as jest.Mock).mockImplementation(() => ({ mutate }))

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ToggleMonitoring refetch={refetch} identifier={'Test_Monitored_service'} enable={false} />
      </TestWrapper>
    )

    const button = document.body.querySelector('[data-name="on-btn"]')
    fireEvent.click(button!)

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(undefined, {
        queryParams: {
          accountId: 'kmpySmUISimoRrJL6NL73w',
          enable: true,
          orgIdentifier: 'default',
          projectIdentifier: 'Demo'
        }
      })
    )
    expect(container).toMatchSnapshot()
  }),
    test('Validate toggle loading state', () => {
      const refetch = jest.fn()
      ;(useSetHealthMonitoringFlag as jest.Mock).mockImplementation(() => ({ loading: true }))

      const { container } = render(
        <TestWrapper {...testWrapperProps}>
          <ToggleMonitoring refetch={refetch} identifier={'Test_Monitored_service'} enable={false} />
        </TestWrapper>
      )

      const button = document.body.querySelector('[data-name="on-btn"]')
      fireEvent.click(button!)

      expect(container).toMatchSnapshot()
    }),
    test('Validate error state', async () => {
      const mutate = jest.fn().mockRejectedValue({
        data: {
          message: 'Something went wrong'
        }
      })
      const refetch = jest.fn()
      ;(useSetHealthMonitoringFlag as jest.Mock).mockImplementation(() => ({ mutate }))

      render(
        <TestWrapper {...testWrapperProps}>
          <ToggleMonitoring refetch={refetch} identifier={'Test_Monitored_service'} enable={false} />
        </TestWrapper>
      )

      const button = document.body.querySelector('[data-name="on-btn"]')
      fireEvent.click(button!)

      await waitFor(() => expect(mutate).toHaveBeenCalled())

      expect(queryByText(document.body, 'Something went wrong'))
    })
})

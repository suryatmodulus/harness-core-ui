import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
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
    ;(useSetHealthMonitoringFlag as jest.Mock).mockImplementation(() => ({ mutate }))

    const { container, getByRole } = render(
      <TestWrapper {...testWrapperProps}>
        <ToggleMonitoring identifier={'Test_Monitored_service'} enable={false} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByRole('checkbox')).toBeVisible())
    fireEvent.click(getByRole('checkbox'))
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
  })
})

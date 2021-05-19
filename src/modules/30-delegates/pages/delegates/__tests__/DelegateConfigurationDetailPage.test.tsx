import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateProfileDetails from '../DelegateConfigurationDetailPage'
import ProfileMock from './ProfileMock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetDelegateProfileNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useUpdateDelegateProfileNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetEnvironmentListForProject: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn()
  })
}))
describe('Delegates Profile Detail', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegateconfigs/:delegateConfigId/"
        pathParams={{ accountId: 'dummy', delegateConfigId: 'delegateConfigId' }}
      >
        <DelegateProfileDetails />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('Render and click Edit', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegateconfigs/:delegateConfigId/"
        pathParams={{ accountId: 'dummy', delegateConfigId: 'delegateConfigId' }}
      >
        <DelegateProfileDetails />
      </TestWrapper>
    )

    const editBtn = container.getElementsByTagName('button')[0]

    await act(async () => {
      fireEvent.click(editBtn!)
    })

    expect(container).toMatchSnapshot()
  })
})

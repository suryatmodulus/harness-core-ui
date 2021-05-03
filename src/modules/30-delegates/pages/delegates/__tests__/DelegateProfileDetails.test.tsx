import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateProfileDetails from '../DelegateConfigurationDetailPage'
import ProfileMock from './ProfileMock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateConfigFromId: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useUpdateV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
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
})

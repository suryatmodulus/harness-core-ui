import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateDetails from '../DelegateDetails'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupFromIdV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        groupId: 'dsadsadsad22',
        delegateType: 'ECS',
        groupName: 'delegate-1',
        groupHostName: '',
        delegateDescription: '',
        delegateConfigurationId: null,
        sizeDetails: null,
        groupImplicitSelectors: {},
        delegateInsightsDetails: [],
        lastHeartBeat: 1616541640941,
        activelyConnected: true,
        delegateInstanceDetails: []
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      loading: false,
      error: null,
      data: {},
      refetch: jest.fn()
    }
  })
}))

describe('Delegates Details Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegates/:delegateId/"
        pathParams={{ accountId: 'dummy', delegateId: 'delegateId' }}
      >
        <DelegateDetails />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

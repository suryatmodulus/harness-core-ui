import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateDetails from '../DelegateDetails'
import Delegatemock from './Delegatemock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: Delegatemock, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateConfigFromId: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
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

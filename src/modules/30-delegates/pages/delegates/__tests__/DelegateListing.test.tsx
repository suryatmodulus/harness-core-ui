import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListing from '../DelegateListing'
import Delegatesmock from './Delegatesmock.json'

jest.mock('services/portal', () => ({
  useGetDelegatesStatusV2: () => ({
    data: Delegatesmock,
    refetch: jest.fn()
  }),
  useDeleteDelegate: () => ({
    mutate: jest.fn()
  })
}))

describe('Delegates Listing', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegatesListing />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

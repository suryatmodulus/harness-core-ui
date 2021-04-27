import React from 'react'
import { render, RenderResult, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, userPathProps } from '@common/utils/routeUtils'
import UserDetails from '../UserDetails'
import { userInfo } from './mock'

jest.mock('services/cd-ng', () => ({
  useGetAggregatedUser: jest.fn().mockImplementation(() => {
    return { data: userInfo, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('react-timeago', () => () => 'dummy date')

describe('UserDetails Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toUserDetails({ ...accountPathProps, ...userPathProps })}
        pathParams={{ accountId: 'testAcc', userIdentifier: 'dummy' }}
      >
        <UserDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('accessControl'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  })
})

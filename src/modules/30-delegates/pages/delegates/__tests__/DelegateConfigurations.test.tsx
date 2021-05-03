import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigurations from '../DelegateConfigurations'
import ProfileMock from './ProfilesMock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteDelegateProfileNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@common/exports', () => ({
  TimeAgo: jest.fn().mockImplementation(() => <div />),
  useConfirmationDialog: jest.fn().mockImplementation(() => <div />)
}))

describe('Delegates Configurations Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

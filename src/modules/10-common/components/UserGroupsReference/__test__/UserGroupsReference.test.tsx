import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import { userGroupMockData } from './usergroupMockData'
jest.mock('services/cd-ng', () => ({
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: userGroupMockData.data, refetch: jest.fn(), error: null, loading: false })
    })
  })
}))
let onSelectDataBool = false
describe('Test full flow', () => {
  test('should render rows with checkbox and return selected data back', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <UserGroupsReference
          onSelect={data => {
            if (data[0].identifier === 'ug1') {
              onSelectDataBool = true
            }
          }}
          scope={Scope.ACCOUNT}
        />
      </TestWrapper>
    )
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    const row = await findByText('User Group 1')
    expect(row).toBeTruthy()
    expect(container).toMatchSnapshot()
    const checkbox = container.querySelector("[class*='bp3-checkbox']") as Element
    expect(checkbox).toBeTruthy()
    fireEvent.click(row)
    expect(container).toMatchSnapshot()
    const applyBtn = await findByText('entityReference.apply')
    expect(onSelectDataBool).toBeFalsy()
    fireEvent.click(applyBtn)
    expect(onSelectDataBool).toBeTruthy()
  })
})

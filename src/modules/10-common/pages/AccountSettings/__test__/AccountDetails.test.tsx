import React from 'react'
import { render, queryByText, act, fireEvent, queryAllByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AccountDetails from '../AccountDetails'

describe('AccountDetails', () => {
  let container: HTMLElement

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toAdmin({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AccountDetails />
      </TestWrapper>
    )
    container = renderObj.container
  })

  test('AccountDetails page', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Change default version', async () => {
      const changeButton = queryByText(container, 'change')

      await act(async () => {
        fireEvent.click(changeButton!)
      })

      expect(queryAllByText(document.body, 'common.switchAccount')).toBeTruthy()
    })
})

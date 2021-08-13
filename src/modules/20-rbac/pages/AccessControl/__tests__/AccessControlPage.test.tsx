import React from 'react'
import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AccessControlPage from '../AccessControlPage'

describe('Access Control Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toAccessControl({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AccessControlPage />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getByText('accessControl'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('click on users', () => {
      const users = getByText('users')
      act(() => {
        fireEvent.click(users)
      })
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toUsers({
            accountId: 'testAcc'
          })
        )
      ).toBeTruthy()
    })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  getByTestId,
  getByText,
  queryByText,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, userPathProps } from '@common/utils/routeUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import UserDetails from '../UserDetails'
import { mockResponse, userGroupInfo, userInfo } from './mock'

const deleteMember = jest.fn()
const deleteMemberMock = (): ResponseBoolean => {
  deleteMember()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  useGetAggregatedUser: jest.fn().mockImplementation(() => {
    return { data: userInfo, refetch: jest.fn(), error: null, loading: false }
  }),
  useRemoveMember: jest.fn().mockImplementation(() => {
    return { mutate: deleteMemberMock }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userGroupInfo, refetch: jest.fn(), error: null, loading: false }
  })
}))

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
    await waitFor(() => getAllByText('accessControl: users'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Delete User Group from User', async () => {
      deleteMember.mockReset()
      const menu = getByTestId(container, 'menu-UserGroup-testGroup')
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      expect(popover).toBeTruthy()
      const deleteMenu = getByText(popover as HTMLElement, 'common.remove')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'rbac.userDetails.userGroup.deleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'common.remove')
        fireEvent.click(deleteBtn!)
        expect(deleteMember).toBeCalled()
      })
    })
})

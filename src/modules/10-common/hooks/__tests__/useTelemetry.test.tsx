/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '../useTelemetry'

const identifyMock = jest.fn()
const trackMock = jest.fn()
const pageMock = jest.fn()
jest.mock('@common/hooks/useTelemetryInstance', () => {
  return {
    useTelemetryInstance: () => {
      return {
        identify: identifyMock,
        track: trackMock,
        page: pageMock
      }
    }
  }
})

describe('useTelemetry', () => {
  test('identifyUser', () => {
    const email = 'test@harness.io'
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper path={routes.toProjects({ accountId: 'dummy' })} pathParams={{ accountId: 'dummy' }}>
        {children}
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useTelemetry({
          pageName: 'page'
        }),
      { wrapper }
    )
    result.current.identifyUser(email)
    result.current.trackEvent('event1', {})
    expect(identifyMock).toHaveBeenCalledWith(email)
    expect(trackMock).toHaveBeenCalledWith({ event: 'event1', properties: { groupId: undefined, userId: '' } })
    expect(pageMock).toHaveBeenCalledWith({
      name: 'page',
      category: '',
      properties: {
        userId: ''
      }
    })
  })
})

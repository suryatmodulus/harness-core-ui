/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'
import useCurrentModule from '@common/hooks/useCurrentModule'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({ useParams: jest.fn() }))

describe('useCurrentModule', () => {
  beforeEach(() => jest.resetAllMocks())

  test('it should return the module name from the router params', function () {
    const moduleName = 'cd'
    ;(useParams as jest.Mock).mockReturnValue({ module: moduleName })

    const { result } = renderHook(() => useCurrentModule())

    expect(result.current).toHaveProperty('module', moduleName)
  })

  test('it should return the isModule function which should return true when the module name from the router params is passed', async () => {
    ;(useParams as jest.Mock).mockReturnValue({ module: 'cd' })

    const { result } = renderHook(() => useCurrentModule())

    expect(result.current).toHaveProperty('isModule')
    expect(result.current.isModule('CD')).toBeTruthy()
    expect(result.current.isModule('CF')).toBeFalsy()
  })

  test('it should return the module as undefined and isModule should return false when the router params do not include a module', async () => {
    ;(useParams as jest.Mock).mockReturnValue({})

    const { result } = renderHook(() => useCurrentModule())

    expect(result.current).toHaveProperty('module', undefined)
    expect(result.current).toHaveProperty('isModule')
    expect(result.current.isModule('CD')).toBeFalsy()
    expect(result.current.isModule('CF')).toBeFalsy()
  })
})

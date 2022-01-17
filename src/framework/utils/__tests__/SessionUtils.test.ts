/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getLoginPageURL } from '../SessionUtils'

describe('Session Utils', () => {
  test('getLoginPageUrl with CG login', () => {
    window.HARNESS_ENABLE_NG_AUTH_UI = false
    expect(getLoginPageURL({ returnUrl: window.location.href })).toBe('/#/login?returnUrl=http%3A%2F%2Flocalhost%2F')
    expect(getLoginPageURL({})).toBe('/#/login')
    expect(getLoginPageURL({ action: 'signout' })).toBe('/#/login?action=signout')
    expect(getLoginPageURL({ returnUrl: window.location.href, action: 'signout' })).toBe(
      '/#/login?returnUrl=http%3A%2F%2Flocalhost%2F&action=signout'
    )
  })

  test('getLoginPageUrl with NG Auth UI', () => {
    window.HARNESS_ENABLE_NG_AUTH_UI = true
    expect(getLoginPageURL({ returnUrl: window.location.href })).toBe(
      '/auth/#/signin?returnUrl=http%3A%2F%2Flocalhost%2F'
    )
    expect(getLoginPageURL({})).toBe('/auth/#/signin')
    expect(getLoginPageURL({ action: 'signout' })).toBe('/auth/#/signin?action=signout')
    expect(getLoginPageURL({ returnUrl: window.location.href, action: 'signout' })).toBe(
      '/auth/#/signin?returnUrl=http%3A%2F%2Flocalhost%2F&action=signout'
    )
  })
})

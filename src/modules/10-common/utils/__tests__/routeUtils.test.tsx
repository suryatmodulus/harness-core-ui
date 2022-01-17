/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { validateReturnUrl, returnLaunchUrl, withOrgIdentifier, withProjectIdentifier } from '../routeUtils'

describe('validateReturnUrl', () => {
  test('different hostname url', () => {
    expect(validateReturnUrl('https://www.youtube.com/')).toBeFalsy()
    expect(validateReturnUrl(encodeURIComponent('https://www.youtube.com/'))).toBeFalsy()
  })
  test('invalid url', () => {
    expect(validateReturnUrl('testing')).toBeFalsy()
  })
  test('valid url', () => {
    expect(validateReturnUrl('/testing')).toBeTruthy()
    expect(validateReturnUrl(encodeURIComponent('/testing'))).toBeTruthy()
  })
  test('same hostname  url', () => {
    expect(validateReturnUrl('https://localhost:8181/#/login')).toBeTruthy()
    expect(validateReturnUrl(encodeURIComponent('https://localhost:8181/#/login'))).toBeTruthy()
  })
  test('Launch redirection url', async () => {
    const redirectionUrl = '#/account/abc123/dashboard'
    const path = returnLaunchUrl(redirectionUrl)
    expect(path).toEqual(`${window.location.pathname}${redirectionUrl}`)
  })
  test('with org identifier', () => {
    const withOrgURL = withOrgIdentifier(() => '/dummy')
    expect(withOrgURL({ orgIdentifier: 'orgId' })).toEqual('/orgs/orgId/dummy')
  })
  test('with project identifier', () => {
    const withProjectURL = withProjectIdentifier(() => '/dummy')
    expect(withProjectURL({ projectIdentifier: 'projectId' })).toEqual('/projects/projectId/dummy')
  })
})

/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

interface GetLoginPageURL {
  returnUrl?: string
  action?: 'signout'
}

export const getLoginPageURL = ({ returnUrl, action }: GetLoginPageURL): string => {
  // pick current path, but remove `/ng/`
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/signin'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/login`
  return returnUrl
    ? `${basePath}?returnUrl=${encodeURIComponent(returnUrl)}${action ? `&action=${action}` : ''}`
    : `${basePath}${action ? `?action=${action}` : ''}`
}

export const getForgotPasswordURL = (): string => {
  return window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/forgot-password'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/forgot-password`
}

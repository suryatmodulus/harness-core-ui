export const getLoginPageURL = (addReturnUrl = true): string => {
  const returnUrl = encodeURIComponent(window.location.href)
  // pick current path, but remove `/ng/`
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/signin'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/login`
  return addReturnUrl ? `${basePath}?returnUrl=${returnUrl}` : basePath
}

export const getForgotPasswordURL = (): string => {
  return window.HARNESS_ENABLE_NG_AUTH_UI
    ? '/auth/#/forgot-password'
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/forgot-password`
}

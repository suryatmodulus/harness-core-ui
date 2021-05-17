export const getLoginPageURL = (addReturnUrl = true): string => {
  const returnUrl = encodeURIComponent(window.location.href)
  // pick current path, but remove `/ng/`
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI ? '/auth/#/signin' : `/login`
  return addReturnUrl ? `${basePath}?returnUrl=${returnUrl}` : basePath
}

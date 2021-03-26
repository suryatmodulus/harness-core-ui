import AppStorage from 'framework/utils/AppStorage'

const getLoginPageURL = (): string => {
  const redirectUrl = encodeURIComponent(window.location.href)

  return `${window.location.pathname.replace(/\/ng\//, '/')}#/login?returnUrl=${redirectUrl}`
}

export const signOut = (): void => {
  AppStorage.clear()
  window.location.href = getLoginPageURL()
}

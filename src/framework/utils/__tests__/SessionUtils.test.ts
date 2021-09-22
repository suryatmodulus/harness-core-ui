import { getLoginPageURL } from '../SessionUtils'

describe('Session Utils', () => {
  test('getLoginPageUrl', () => {
    expect(getLoginPageURL({ returnUrl: window.location.href })).toBe('/#/login?returnUrl=http%3A%2F%2Flocalhost%2F')
    expect(getLoginPageURL({})).toBe('/#/login')
  })
})

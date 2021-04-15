import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'

export const defaultAppStoreTestData: AppStoreContextProps = {
  featureFlags: {},
  updateAppStore: jest.fn(),
  currentUserInfo: {}
}

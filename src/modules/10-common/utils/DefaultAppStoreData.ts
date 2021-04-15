import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import type { Project } from 'services/cd-ng'

export const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD', 'CV'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}
export const defaultAppStoreValues: Pick<
  AppStoreContextProps,
  'selectedProject' | 'featureFlags' | 'currentUserInfo'
> = {
  selectedProject: {
    orgIdentifier: 'testOrg',
    identifier: 'test',
    name: 'test',
    color: '#e6b800',
    modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
    description: 'test',
    tags: { tag1: '', tag2: 'tag3' }
  },
  featureFlags: {
    CDNG_ENABLED: true,
    CVNG_ENABLED: true,
    CING_ENABLED: true,
    CENG_ENABLED: true,
    CFNG_ENABLED: true
  },
  currentUserInfo: {
    uuid: 'dummyId',
    name: 'dummyname',
    email: 'dummy@harness.io',
    admin: false,
    twoFactorAuthenticationEnabled: false
  }
}

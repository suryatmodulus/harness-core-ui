import type { RestResponseBoolean, LoginSettings } from 'services/cd-ng'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import { ResourceType } from '@rbac/interfaces/ResourceType'

export const mockResponse: RestResponseBoolean = {
  metaData: {},
  resource: true,
  responseMessages: []
}

export const loginSettings: LoginSettings = {
  uuid: '123',
  accountId: '123',
  lastUpdatedAt: 1617864012452,
  userLockoutPolicy: {
    enableLockoutPolicy: true,
    numberOfFailedAttemptsBeforeLockout: 6,
    lockOutPeriod: 24,
    notifyUser: true
  },
  passwordExpirationPolicy: {
    enabled: true,
    daysBeforePasswordExpires: 30,
    daysBeforeUserNotifiedOfPasswordExpiration: 3
  },
  passwordStrengthPolicy: {
    enabled: true,
    minNumberOfCharacters: 12,
    minNumberOfUppercaseCharacters: 1,
    minNumberOfLowercaseCharacters: 1,
    minNumberOfSpecialCharacters: 1,
    minNumberOfDigits: 1
  }
}

export const authSettings = {
  ngAuthSettings: [
    {
      loginSettings,
      settingsType: AuthenticationMechanisms.USER_PASSWORD
    },
    {
      allowedProviders: ['GITHUB', 'AZURE', 'LINKEDIN', 'BITBUCKET', 'GOOGLE'],
      settingsType: AuthenticationMechanisms.OAUTH
    }
  ],
  whitelistedDomains: [],
  authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD,
  twoFactorEnabled: false
}

export const permissionRequest = {
  resourceScope: {
    accountIdentifier: 'accountId'
  },
  resource: {
    resourceType: ResourceType.AUTHSETTING
  }
}

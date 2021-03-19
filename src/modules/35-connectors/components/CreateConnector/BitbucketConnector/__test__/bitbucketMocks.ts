import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'BitbucketWorking',
  identifier: 'BitbucketWorking',
  description: 'Bitbucket description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Bitbucket',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    type: 'Account'
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy bitbucket name',
  identifier: 'dummyBitbucketIdentifier',
  description: 'dummy bitbucket description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Bitbucket',
  spec: {
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: null, passwordRef: 'account.githubPassword' }
      }
    },
    apiAccess: null,
    type: 'Account'
  }
}

export const usernameTokenWithAPIAccess: ConnectorInfoDTO = {
  name: 'BitbucketWorking',
  identifier: 'BitbucketWorking',
  description: 'Bitbucket description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Bitbucket',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    apiAccess: {
      type: 'UsernamePassword',
      spec: { username: 'dev', usernameRef: undefined, tokenRef: 'account.githubPassword' }
    },
    type: 'Account'
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'githubPassword',
      identifier: 'githubPassword',
      tags: {},
      description: 'for github connector',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1608671838510,
    updatedAt: 1608671838510,
    draft: false
  },
  metaData: null,
  correlationId: '349437d7-c6f8-4e14-9b62-64d9acec688d'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

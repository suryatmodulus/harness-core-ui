import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Github',
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

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy github name',
  identifier: 'dummyGithubIdentifier',
  description: 'dummy github description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Github',
  spec: {
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    apiAccess: null,
    type: 'Account'
  }
}

export const usernameTokenWithAPIAccessGithubApp: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Github',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef: 'account.githubPassword' }
      }
    },
    apiAccess: {
      type: 'GithubApp',
      spec: { installationId: '1234', applicationId: '1234', privateKeyRef: 'account.githubPassword' }
    },
    type: 'Account'
  }
}

export const usernameTokenWithAPIAccessToken: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Github',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef: 'account.githubPassword' }
      }
    },
    apiAccess: {
      type: 'Token',
      spec: { tokenRef: 'account.githubPassword' }
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

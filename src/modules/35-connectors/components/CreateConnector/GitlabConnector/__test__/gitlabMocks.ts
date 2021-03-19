import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'GitlabWorking',
  identifier: 'asasas',
  description: 'connector description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Gitlab',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://gitlab.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.gitlabPassword' }
      }
    },
    type: 'Account'
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy gitlab name',
  identifier: 'dummyGitlabIdentifier',
  description: 'dummy gitlab description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Gitlab',
  spec: {
    url: 'https://gitlab.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: null, passwordRef: 'account.gitlabPassword' }
      }
    },
    apiAccess: null,
    type: 'Account'
  }
}

export const sshAuthWithAPIAccessToken: ConnectorInfoDTO = {
  name: 'GitlabWorking',
  identifier: 'asasas',
  description: 'connector description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Gitlab',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://gitlab.com/dev',
    authentication: { type: 'Ssh', spec: { sshKeyRef: 'account.gitlabPassword' } },
    apiAccess: { type: 'Token', spec: { tokenRef: 'account.gitlabPassword' } },
    type: 'Account'
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'gitlabPassword',
      identifier: 'gitlabPassword',
      tags: {},
      description: 'for gitlab connector',
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

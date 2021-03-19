import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const jiraMock: ConnectorInfoDTO = {
  name: 'jiraConnector',
  description: 'devConnector description',
  identifier: 'devConnector',
  orgIdentifier: '',
  projectIdentifier: '',

  type: 'Jira',
  spec: {
    jiraUrl: 'https://jira.dev.harness.io/'
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'jiraConnector',
  description: 'devConnector description',
  identifier: 'devConnector',
  orgIdentifier: '',
  projectIdentifier: '',

  type: 'Jira',
  spec: {
    jiraUrl: 'https://jira.dev.harness.io/',
    username: 'harnessadmin',
    passwordRef: 'jira_secret'
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'b13',
      identifier: 'b13',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1604742762283,
    updatedAt: 1604742762283,
    draft: false
  },
  metaData: null,
  correlationId: '435ce32f-4c80-4822-b01a-086186780958'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

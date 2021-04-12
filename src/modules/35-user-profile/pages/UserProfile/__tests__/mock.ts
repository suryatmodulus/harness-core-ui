import type { ResponseBoolean, ResponseListSourceCodeManagerDTO } from 'services/cd-ng'

export const userMockData = {
  status: 'SUCCESS',
  data: { uuid: 'abc', name: 'dummy', email: 'dummy@harness.io', admin: false },
  metaData: undefined,
  correlationId: ''
}
export const mockSecretList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'selected_secret',
          identifier: 'selected_secret',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'New_Vault_Read_only', valueType: 'Inline', value: null }
        },
        createdAt: 1611917313699,
        updatedAt: 1611917313699,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'abb45801-d524-44ab-824c-aa532c367f39'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const createBitBucket = {
  status: 'SUCCESS',
  data: {
    userIdentifier: 'lv0euRhKRCyiXWzS7pOg6g',
    name: 'BB UP',
    type: 'BITBUCKET',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'Uname', usernameRef: null, passwordRef: 'account.selected_secret' }
      }
    }
  },
  metaData: null,
  correlationId: 'd635564d-c97d-47a6-8e86-eb0f96837fc9'
}

export const sourceCodeManagers: ResponseListSourceCodeManagerDTO = {
  status: 'SUCCESS',
  data: [
    {
      userIdentifier: 'lv0euRhKRCyiXWzS7pOg6g',
      name: 'BB UP',
      createdAt: 1617868887547,
      lastModifiedAt: 1617868887547,
      type: 'BITBUCKET',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'Uname', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      }
    },
    {
      userIdentifier: 'lv0euRhKRCyiXWzS7pOg6g',
      name: 'New Git lab',
      createdAt: 1617868975336,
      lastModifiedAt: 1617868975336,
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'hcbhdbchbvf', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      },
      type: 'GITLAB'
    },
    {
      userIdentifier: 'lv0euRhKRCyiXWzS7pOg6g',
      name: 'jnvjgnjngjbn',
      createdAt: 1617868814533,
      lastModifiedAt: 1617868814533,
      type: 'GITHUB',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'ngjnbjgnbjngb', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      }
    }
  ],
  metaData: undefined,
  correlationId: ''
}

export const connectorMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'Harness Vault',
          identifier: 'harnessSecretManager',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Local',
          spec: { default: false }
        },
        createdAt: 1611554426106,
        lastModifiedAt: 1611554426104,
        status: {
          status: 'FAILURE',
          errorSummary: null,
          errors: null,
          testedAt: 1611901202067,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: { lastActivityTime: 1611554426104 },
        harnessManaged: true
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: ''
}

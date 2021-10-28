import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponsePageAuditEventDTO } from 'services/audit'

export const mockApiErrorResponse: UseGetMockDataWithMutateAndRefetch<ResponsePageAuditEventDTO> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  // eslint-disable-next-line
  // @ts-ignore
  error: {
    message: 'someerror'
  },
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {}
  }
}

export const mockApiFetchingResponse: UseGetMockDataWithMutateAndRefetch<ResponsePageAuditEventDTO> = {
  loading: true,
  refetch: jest.fn(),
  mutate: jest.fn(),
  cancel: jest.fn(),
  data: {}
}

export const mockApiSuccessResponse: UseGetMockDataWithMutateAndRefetch<ResponsePageAuditEventDTO> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  cancel: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          auditId: '6177eba01c56557bc73d1689',
          resourceScope: {
            accountIdentifier: 'acId',
            orgIdentifier: 'orgId',
            projectIdentifier: 'pId'
          },
          httpRequestInfo: {
            requestMethod: 'PUT'
          },
          requestMetadata: {
            clientIP: '125.19.67.142'
          },
          timestamp: 1635249054964,
          authenticationInfo: {
            principal: {
              type: 'USER',
              identifier: 'admin@harness.io'
            },
            labels: {
              userId: 'userId',
              username: 'Admin'
            }
          },
          module: 'TEMPLATESERVICE',
          resource: {
            type: 'TEMPLATE',
            identifier: 'NewTemplate',
            labels: {
              versionLabel: 'v2'
            }
          },
          // eslint-disable-next-line
          // @ts-ignore
          action: 'DEFAULT'
        },
        {
          auditId: '6177eba01c56557bc73d1687',
          insertId: 's',
          resourceScope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'default',
            projectIdentifier: 'ArchitProject'
          },
          httpRequestInfo: {
            requestMethod: 'PUT'
          },
          requestMetadata: {
            clientIP: '125.19.67.142'
          },
          timestamp: 1635249054951,
          authenticationInfo: {
            principal: {
              type: 'USER',
              identifier: 'admin@harness.io'
            }
          },
          module: 'TEMPLATESERVICE',
          resource: {
            type: 'TEMPLATE',
            identifier: 'NewTemplate',
            labels: {
              versionLabel: 'v2'
            }
          },
          action: 'UPDATE'
        },
        {
          auditId: '6177eba01c56557bc73d1685',
          insertId: 's2',
          resourceScope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'default',
            projectIdentifier: 'ArchitProject'
          },
          httpRequestInfo: {
            requestMethod: 'POST'
          },
          requestMetadata: {
            clientIP: '125.19.67.142'
          },
          timestamp: 1635249054937,
          authenticationInfo: {
            principal: {
              type: 'USER',
              identifier: 'admin@harness.io'
            },
            labels: {
              userId: 'lv0euRhKRCyiXWzS7pOg6g',
              username: 'Admin'
            }
          },
          module: 'TEMPLATESERVICE',
          resource: {
            type: 'TEMPLATE',
            identifier: 'NewTemplate',
            labels: {
              versionLabel: 'v1'
            }
          },
          action: 'CREATE'
        }
      ]
    }
  }
}

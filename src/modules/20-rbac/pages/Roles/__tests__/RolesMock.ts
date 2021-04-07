import type { ResponsePageRoleResponse } from 'services/rbac'

export const rolesMockList: ResponsePageRoleResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: 'role1',
          name: 'role 1',
          permissions: [],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613471787889,
        lastModifiedAt: 1613551258686
      },
      {
        role: {
          identifier: 'role2',
          name: 'role 2',
          permissions: [],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613543661350,
        lastModifiedAt: 1613543661350
      },
      {
        role: {
          identifier: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          permissions: [],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: false,
        createdAt: 1613543805827,
        lastModifiedAt: 1613543805827
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: {},
  correlationId: '25fa2bbe-a0cd-4579-bf25-ba612c2d1201'
}

export const createRoleMockData = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        role: {
          identifier: 'role1',
          name: 'role 1',
          permissions: [],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        }
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}

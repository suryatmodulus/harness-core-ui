import type { ResponsePageOrganizationResponse } from 'services/cd-ng'

export const orgMockData: ResponsePageOrganizationResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 50,
    content: [
      {
        organization: {
          identifier: 'testOrg',
          name: 'Org Name',
          description: 'Description',
          tags: { tag1: '', tag2: 'tag3' }
        }
      },
      {
        organization: {
          identifier: 'default',
          name: 'default',
          description: 'default',
          tags: { tag1: '', tag2: 'tag3' }
        },
        harnessManaged: true
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: 'f932d48d-e486-4481-9348-c8ded750d2c3'
}

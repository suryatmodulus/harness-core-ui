export default {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 100,
    content: [
      {
        accountId: 'accountId',
        identifier: 'selected_service',
        orgIdentifier: 'OrgOneTwo',
        projectIdentifier: 'hello',
        name: 'Selected Service',
        description: 'test',
        deleted: false,
        tags: {
          tag1: '',
          tag2: 'asd'
        },
        version: 0
      },
      {
        accountId: 'accountId',
        identifier: 'other_service',
        orgIdentifier: 'OrgOneTwo',
        projectIdentifier: 'hello',
        name: 'Other Service',
        description: 'other test',
        deleted: false,
        tags: {
          tag1: '',
          tag2: 'asd'
        },
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '8b5d64aa-93f4-4858-984a-e0d5840f8e36'
}

export const servicesV2Mock = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 100,
    content: [
      {
        service: {
          accountId: 'accountId',
          identifier: 'selected_service',
          orgIdentifier: 'OrgOneTwo',
          projectIdentifier: 'hello',
          name: 'Selected Service',
          description: 'test',
          deleted: false,
          tags: {
            tag1: '',
            tag2: 'asd'
          },
          version: 0
        }
      },
      {
        service: {
          accountId: 'accountId',
          identifier: 'other_service',
          orgIdentifier: 'OrgOneTwo',
          projectIdentifier: 'hello',
          name: 'Other Service',
          description: 'other test',
          deleted: false,
          tags: {
            tag1: '',
            tag2: 'asd'
          },
          version: 0
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '8b5d64aa-93f4-4858-984a-e0d5840f8e36'
}

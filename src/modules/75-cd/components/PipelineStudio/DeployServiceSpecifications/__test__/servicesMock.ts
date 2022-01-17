/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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

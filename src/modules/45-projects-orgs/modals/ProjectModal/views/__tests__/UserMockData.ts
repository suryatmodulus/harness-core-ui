/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ResponsePageUserMetadataDTO } from 'services/cd-ng'

export const userMockData: ResponsePageUserMetadataDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 50,
    content: [
      { name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' },
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '5c453afd-179b-44f6-8fc7-6f30a5698453'
}

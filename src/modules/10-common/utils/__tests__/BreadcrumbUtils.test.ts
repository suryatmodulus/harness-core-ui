/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import { getLinkForAccountResources } from '../BreadcrumbUtils'

describe('Breadcrumb utils', () => {
  test('should show Account Resources in account scope', () => {
    const returnValue = getLinkForAccountResources({ accountId: 'accountid', getString: noop as any })
    expect(returnValue).toMatchObject([{ label: undefined, url: '/account/accountid/settings/resources' }])
  })

  test('should NOT show Account Resources in org scope', () => {
    const returnValue = getLinkForAccountResources({
      accountId: 'accountid',
      getString: noop as any,
      orgIdentifier: 'orgid'
    })
    expect(returnValue).toMatchObject([])
  })

  test('should NOT show Account Resources in project scope', () => {
    const returnValue = getLinkForAccountResources({
      accountId: 'accountid',
      getString: noop as any,
      orgIdentifier: 'orgId',
      projectIdentifier: 'projectId'
    })
    expect(returnValue).toMatchObject([])
  })
})

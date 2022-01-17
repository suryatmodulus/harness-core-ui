/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import DefaultRenderer from '@projects-orgs/components/ModuleRenderer/DefaultRenderer'

describe('Default Renderer test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <DefaultRenderer />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

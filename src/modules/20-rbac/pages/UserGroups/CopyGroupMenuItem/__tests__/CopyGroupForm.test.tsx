/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import CopyGroupForm from '../CopyGroupForm'

describe('Copy group form test', () => {
  test('render', () => {
    const renderObj = (
      <TestWrapper>
        <CopyGroupForm closeModal={jest.fn} identifier="dummy_identifier" />
      </TestWrapper>
    )
    expect(renderObj).toMatchSnapshot()
  })
})

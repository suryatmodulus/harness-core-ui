/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum, ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from './ExecutionStatusLabel'

describe('<ExecutionStatusLabel /> tests', () => {
  test.each(Object.values(ExecutionStatusEnum))('%s', (status: ExecutionStatus) => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStatusLabel status={status} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceInstanceLabel } from '../ServiceInstanceLabel'

describe('Unit tests for ServiceInstanceLabel', () => {
  test('Ensure label is rendered correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <ServiceInstanceLabel />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

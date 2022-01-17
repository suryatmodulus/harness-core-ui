/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import { TestWrapper } from '@common/utils/testUtils'

describe('CFEnvironmentSelect', () => {
  test('it should render the passed component with the label', async () => {
    render(<CFEnvironmentSelect component={<span data-testid="test-component">Test component</span>} />, {
      wrapper: TestWrapper
    })

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('environment')).toBeInTheDocument()
  })
})

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StepLabel } from '../StepLabel'

describe('Unit tests for StepLabel', () => {
  test('Ensure that nothing is rendered when a step greater than total numbers are provided', async () => {
    const { container } = render(
      <TestWrapper>
        <StepLabel stepNumber={4} totalSteps={2} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="invalidIndex"]')).not.toBeNull())
  })

  test('Ensure that label colors are correct when step number 1 of 2 is provided', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StepLabel stepNumber={1} totalSteps={2} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('step 1 of 2')).not.toBeNull())
    expect(container.querySelector('p[class*="main"]')?.getAttribute('style')).toEqual('color: rgb(30, 92, 31);')
  })

  test('Ensure that label colors are correct when step 2 of 2 is provided', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StepLabel stepNumber={2} totalSteps={2} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('step 2 of 2')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})

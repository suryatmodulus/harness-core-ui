/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RefreshViewForNewData } from '../RefreshForNewData'

describe('Unit tests for RefreshForNewButton', () => {
  test('Ensure button is clickable and passed in func is called', async () => {
    const onClickFn = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <RefreshViewForNewData onClick={onClickFn} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('refresh')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="main"]')!)
    await waitFor(() => expect(onClickFn).toHaveBeenCalled())
  })
})

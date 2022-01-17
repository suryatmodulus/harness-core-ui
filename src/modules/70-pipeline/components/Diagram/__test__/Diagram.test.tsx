/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DiagramDemo } from '../Diagram.stories'

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

describe('Test Diagram App', () => {
  test('should test basic snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <DiagramDemo />
      </TestWrapper>
    )
    waitFor(() => expect(container.querySelector('.bp3-active [data-icon="execution"]')))
    expect(container).toMatchSnapshot()
    const rollbackBtn = container.querySelector('[data-icon="rollback-execution"]')
    fireEvent.click(rollbackBtn!)
    waitFor(() => expect(container.querySelector('.bp3-active [data-icon="rollback-execution"]')))
    const executionBtn = container.querySelector('[data-icon="execution"]')
    fireEvent.click(executionBtn!)
    waitFor(() => expect(container.querySelector('.bp3-active [data-icon="execution"]')))
  })
})

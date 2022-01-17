/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { TableFilter } from '../TableFilter'

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as any),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

describe('Unit tests for TableWithColumnFilter', () => {
  test('Ensure column name is rendered and function is called on rendered', async () => {
    const onFilterMock = jest.fn()
    const { container } = render(<TableFilter onFilter={onFilterMock} placeholder="ColumnFilter" />)
    await waitFor(() => expect(container.querySelector('input[placeholder="ColumnFilter"]')).not.toBeNull())
    const filterInput = container.querySelector('input')
    if (!filterInput) {
      throw Error('Filter input was not found.')
    }

    fireEvent.change(filterInput, { target: { value: 'solo-dolo' } })
    await waitFor(() => expect(onFilterMock).toHaveBeenCalledTimes(1))
  })
})

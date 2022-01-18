/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { items } from './mock'
import IconGrid from '../IconGrid'

describe('IconGrid', () => {
  test('Default render', async () => {
    const { container } = render(
      <TestWrapper>
        <IconGrid items={items} iconProps={{ name: 'polygon' }} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="polygon"]')).toHaveLength(5)

    // + should not be present
    expect(screen.queryByText('+')).not.toBeInTheDocument()

    // Health score 99
    fireEvent.mouseOver(container.querySelectorAll('[data-icon="polygon"]')[0])
    await waitFor(() => expect(screen.queryByText(`${items[0].healthScore}`)).toBeInTheDocument())

    // No Data
    fireEvent.mouseOver(container.querySelectorAll('[data-icon="polygon"]')[3])
    await waitFor(() => expect(screen.queryByText('noData')).toBeInTheDocument())
  })

  test('Without max prop', () => {
    const defaultMax = 8
    const doubledItems = [...items, ...items]

    const { container } = render(
      <TestWrapper>
        <IconGrid items={doubledItems} iconProps={{ name: 'polygon' }} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="polygon"]')).toHaveLength(defaultMax)

    // +2 text after limit
    expect(screen.queryByText(`+${doubledItems.length - defaultMax}`)).toBeInTheDocument()
  })

  test('With max prop', () => {
    const max = 4

    const { container } = render(
      <TestWrapper>
        <IconGrid items={items} iconProps={{ name: 'polygon' }} max={max} />
      </TestWrapper>
    )

    // Max items
    expect(container.querySelectorAll('[data-icon="polygon"]')).toHaveLength(max)

    // +1 text after limit
    expect(screen.queryByText(`+${items.length - max}`)).toBeInTheDocument()
  })
})

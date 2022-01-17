/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ContextMenuActions from '../ContextMenuActions'

describe('ContextMenuActions', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ContextMenuActions
          titleText="Delete Title"
          contentText="Are you sure?"
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('calls passed callbacks', () => {
    const onDelete = jest.fn()
    const onEdit = jest.fn()
    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <ContextMenuActions titleText="Delete Title" contentText="Are you sure?" onDelete={onDelete} onEdit={onEdit} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('button')!)
    fireEvent.click(getAllByText('edit')[0])
    expect(onEdit).toHaveBeenCalled()
    fireEvent.click(getByText('delete'))
    fireEvent.click(document.querySelectorAll('.bp3-dialog button')[0])
    expect(onDelete).toHaveBeenCalled()
  })
})

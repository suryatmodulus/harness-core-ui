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
    fireEvent.click(document.querySelectorAll('.bp3-dialog-footer button')[0])
    expect(onDelete).toHaveBeenCalled()
  })
})

import React from 'react'

import { render, waitFor, getByText as getByTextBody, queryByAttribute, fireEvent, act } from '@testing-library/react'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import InlineVarFile from '../Editview/InlineVarFile'

const props = {
  arrayHelpers: {
    push: jest.fn(),
    replace: jest.fn()
  },
  isEditMode: false,
  selectedVarIndex: -1,
  showTfModal: true,
  selectedVar: {},
  onClose: jest.fn(),
  onSubmit: jest.fn()
}
describe('Inline var file testing', () => {
  test('initial render', async () => {
    render(
      <TestWrapper>
        <InlineVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })

  test('fill form and click submit', async () => {
    render(
      <TestWrapper>
        <InlineVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', dialog, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('varFile.identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('varFile.spec.content')!, { target: { value: 'test content' } })
    })
    fireEvent.click(dialog.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.onSubmit).toBeCalled()
    })
  })

  test('edit view for inline vars', async () => {
    const defaultProps = {
      arrayHelpers: {
        push: jest.fn(),
        replace: jest.fn()
      },
      isEditMode: false,
      selectedVarIndex: 1,
      showTfModal: true,
      selectedVar: {
        varFile: {
          identifer: 'test',
          spec: {
            content: 'test-content'
          }
        }
      },
      onClose: jest.fn(),
      onSubmit: jest.fn()
    }
    render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })
})

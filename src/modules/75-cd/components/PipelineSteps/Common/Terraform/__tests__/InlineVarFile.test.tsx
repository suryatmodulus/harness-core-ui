import React from 'react'

import { render, waitFor, getByText as getByTextBody, fireEvent, act } from '@testing-library/react'

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

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

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

  test('click submit for inline var file', async () => {
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
    const { getByText } = render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))

    act(() => {
      fireEvent.click(getByText('submit'))
      expect(dialog).toMatchSnapshot()
      waitFor(() => expect(props.onSubmit).toBeCalled())
    })
  })
})

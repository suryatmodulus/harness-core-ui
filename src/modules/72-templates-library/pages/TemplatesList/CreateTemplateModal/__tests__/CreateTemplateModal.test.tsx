import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateModalProps, CreateTemplateModal } from '../CreateTemplateModal'

const getProps = (): CreateModalProps => ({
  onClose: jest.fn(),
  initialValues: {
    templateEntityType: 'step'
  }
})

describe('CREATE MODE', () => {
  test('VALIDATIONS', async () => {
    const props = getProps()
    const { getByText, queryByText } = render(
      <TestWrapper>
        <CreateTemplateModal {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('create'))
    })
    await waitFor(() => expect(queryByText('templatesLibrary.createNewModal.validation.name')).toBeTruthy())
  })

  test('if form changesupdate the preview card', async () => {
    const props = getProps()
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <CreateTemplateModal {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(getByPlaceholderText('common.namePlaceholder'), { target: { value: 'templatename' } })
    })
    expect(container).toMatchSnapshot('changed value should be present in the preview')
  })

  test('if form closes', async () => {
    const props = getProps()
    const { container, getByText } = render(
      <TestWrapper>
        <CreateTemplateModal {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('cancel'))
    })
    await waitFor(() => expect(props.onClose).toBeCalled())

    const crossIcon = container.querySelector('span[icon="cross"]')
    act(() => {
      fireEvent.click(crossIcon!)
    })
    await waitFor(() => expect(props.onClose).toBeCalled())
  })
})

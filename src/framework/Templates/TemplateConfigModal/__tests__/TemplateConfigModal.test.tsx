import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ConfigModalProps, TemplateConfigModal } from '../TemplateConfigModal'

const getProps = (): ConfigModalProps => ({
  onClose: jest.fn(),
  initialValues: {
    name: '',
    type: 'Step',
    identifier: 'My_Step_Template',
    versionLabel: 'v1',
    repo: 'test_repo',
    branch: 'test_branch'
  },
  modalProps: {
    title: 'Some Title',
    promise: Promise.resolve
  },
  showGitFields: false
})

describe('CREATE MODE', () => {
  test('VALIDATIONS', async () => {
    const props = getProps()
    const { getByText, queryByText } = render(
      <TestWrapper>
        <TemplateConfigModal {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(queryByText('common.validation.fieldIsRequired')).toBeTruthy())
  })

  test('if form changesupdate the preview card', async () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <TemplateConfigModal {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'templatename' } })
    })
    expect(container).toMatchSnapshot('changed value should be present in the preview')
  })

  test('if form closes', async () => {
    const props = getProps()
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateConfigModal {...props} />
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

import React from 'react'
import { render, waitFor, getByText as getByTextBody, fireEvent, act } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import TfVarFile from '../Editview/TfVarFile'

const props = {
  onHide: jest.fn(),
  onSubmit: jest.fn()
}
describe('Terraform var file creation testing', () => {
  test('initial render', async () => {
    render(
      <TestWrapper>
        <TfVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'pipelineSteps.addTerraformVarFile'))
    expect(dialog).toMatchSnapshot()
  })

  test('submits successfully for inline store type', async () => {
    const { container } = render(
      <TestWrapper>
        <TfVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'pipelineSteps.addTerraformVarFile'))

    fillAtForm([
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.type',
        value: 'inline'
      }
    ])
    fireEvent.click(getByTextBody(dialog, 'addFile'))

    expect(props.onSubmit).toBeCalled()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('form with right payload - for remote store type', async () => {
    const { container } = render(
      <TestWrapper>
        <TfVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'pipelineSteps.addTerraformVarFile'))

    fillAtForm([
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.type',
        value: 'remote'
      },
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.store.spec.gitFetchType',
        value: 'pipelineSteps.deploy.inputSet.branch'
      }
    ])
    await act(async () => {
      fireEvent.click(dialog.querySelector('[data-testid="add-header"]')!)
    })

    await act(async () => {
      const path0 = dialog.querySelector('input[name="varFile.store.spec.paths[0].path"]')
      fireEvent.change(path0!, { target: { value: 'testInput1' } })
      expect(dialog).toMatchSnapshot()
    })
    fireEvent.click(getByTextBody(dialog, 'addFile'))

    expect(props.onSubmit).toBeCalled()
    expect(dialog).toMatchSnapshot()
  })

  test('removing path successfully', async () => {
    const { container } = render(
      <TestWrapper>
        <TfVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'pipelineSteps.addTerraformVarFile'))

    fillAtForm([
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.type',
        value: 'inline'
      }
    ])

    expect(dialog).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('form with right payload - for remote store type', async () => {
    const { container, findByTestId } = render(
      <TestWrapper>
        <TfVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'pipelineSteps.addTerraformVarFile'))

    fillAtForm([
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.type',
        value: 'remote'
      },
      {
        container: container,
        type: InputTypes.SELECT,
        fieldId: 'varFile.store.spec.gitFetchType',
        value: 'pipelineSteps.deploy.inputSet.branch'
      }
    ])
    await act(async () => {
      fireEvent.click(dialog.querySelector('[data-testid="add-header"]')!)
    })

    await act(async () => {
      const path0 = dialog.querySelector('input[name="varFile.store.spec.paths[0].path"]')
      fireEvent.change(path0!, { target: { value: 'testInput1' } })
    })

    await act(async () => {
      const trashIcon = await findByTestId('remove-header-0')
      fireEvent.click(trashIcon!)
    })

    expect(container).toMatchSnapshot()
  })
})

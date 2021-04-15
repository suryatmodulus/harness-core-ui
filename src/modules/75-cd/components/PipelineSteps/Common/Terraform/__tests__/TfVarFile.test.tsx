import React from 'react'
import { render, waitFor, getByText as getByTextBody } from '@testing-library/react'
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

  test(' form with right payload - for inline store type', async () => {
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
        fieldId: 'type',
        value: 'inline'
      }
    ])

    expect(dialog).toMatchSnapshot()
  })

  test('form with right payload - for remote store type', async () => {
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
        fieldId: 'type',
        value: 'remote'
      }
    ])
    expect(dialog).toMatchSnapshot()
  })
})

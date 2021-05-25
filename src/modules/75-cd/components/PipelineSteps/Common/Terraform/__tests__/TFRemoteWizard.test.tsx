import React from 'react'

import { render, queryByAttribute, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TFRemoteWizard } from '../Editview/TFRemoteWizard'

const props = {
  name: 'Terraform Var File Details',
  onSubmitCallBack: jest.fn(),
  isEditMode: false
}
describe('Terraform Remote Form tests', () => {
  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <TFRemoteWizard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when gitfetchtype is branch', async () => {
    const { container } = render(
      <TestWrapper>
        <TFRemoteWizard {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('varFile.identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('pipeline.manifestType.gitFetchTypeLabel')!, {
        target: { value: 'pipelineSteps.deploy.inputSet.branch' }
      })
      fireEvent.change(queryByNameAttribute('pipelineSteps.deploy.inputSet.branch')!, {
        target: { value: 'test' }
      })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.onSubmitCallBack).toBeCalled()
    })
  })
})

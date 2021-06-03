import React from 'react'

import { render } from '@testing-library/react'
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
})

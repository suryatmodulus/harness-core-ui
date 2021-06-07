import React from 'react'

import { render, queryByAttribute, fireEvent, act } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { TFVarStore } from '../Editview/TFVarStore'

const props = {
  name: 'Terraform Var store',
  initialValues: {
    varFile: {
      type: 'Remote'
    }
  },
  isEditMode: false
}
describe('Terraform Var Store tests', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('select one of the types', async () => {
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...props} />
      </TestWrapper>
    )

    const storeCard = queryByAttribute('data-testid', container, 'varStore-Git')
    act(() => {
      fireEvent.click(storeCard!)
    })
    expect(container).toMatchSnapshot()
  })
})

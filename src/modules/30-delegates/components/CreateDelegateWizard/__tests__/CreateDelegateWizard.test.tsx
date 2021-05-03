import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateDelegateWizard } from '../CreateDelegateWizard'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => {
  const ComponentToMock = () => <div>yamlDiv</div>
  return ComponentToMock
})
describe('Create Delegate Wizard', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <CreateDelegateWizard />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

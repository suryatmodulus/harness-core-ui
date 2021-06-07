import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateDelegateWizard } from '../CreateDelegateWizard'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/portal', () => ({
  useGetDelegateSizes: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          size: 'MEDIUM',
          label: 'medium',
          ram: '16',
          cpu: '4'
        }
      ],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
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

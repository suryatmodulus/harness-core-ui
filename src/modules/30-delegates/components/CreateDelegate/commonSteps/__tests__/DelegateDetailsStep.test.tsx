import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateTypes } from '@delegates/constants'
import DelegateDetailsStep from '../DelegateDetailsStep'

const mockFn = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSizes: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: [
          {
            size: 'MEDIUM',
            label: 'medium',
            ram: '16',
            cpu: '4'
          }
        ]
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('Delgate Details StepWizard', () => {
  test('render DelegateDetailsStep', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateDetailsStep type={DelegateTypes.KUBERNETES_CLUSTER} name={'Step 1'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click continue button', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateDetailsStep type={DelegateTypes.KUBERNETES_CLUSTER} name={'Step 1'} onClick={mockFn} />
      </TestWrapper>
    )
    const step1ContinueButton = container?.querySelector('#step1ContinueButton')
    fireEvent.click(step1ContinueButton!)
    await wait()
    expect(container).toMatchSnapshot()
  })
})

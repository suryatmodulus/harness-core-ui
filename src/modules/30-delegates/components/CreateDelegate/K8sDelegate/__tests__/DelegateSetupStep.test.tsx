import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateSetupStep from '../DelegateSetupStep/DelegateSetupStep'
import DelegateSizesmock from './DelegateSizesmock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateProfilesV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateSizes: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: DelegateSizesmock, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateKubernetesYaml: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Create DelegateSetup Step', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSetupStep />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

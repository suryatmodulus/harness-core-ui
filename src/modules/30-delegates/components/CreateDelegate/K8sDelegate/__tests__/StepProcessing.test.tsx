import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StepProcessing from '../StepProcessing/StepProcessing'

const mockGetCallFunction = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegatesInitializationDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create StepProcessing Component', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <StepProcessing />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateInitialization from '../DelegateInitialization/DelegateInitialization'

const mockGetCallFunction = jest.fn()
const setShowError = jest.fn()
const setShowSuccess = jest.fn()
const setIsDelegateInitialised = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegatesInitializationDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create DelegateInitialization Component', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateInitialization
          setShowError={setShowError}
          setShowSuccess={setShowSuccess}
          isDelegateInitialized={true}
          setIsDelegateInitialised={setIsDelegateInitialised}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

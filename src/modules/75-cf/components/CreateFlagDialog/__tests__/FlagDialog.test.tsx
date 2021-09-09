import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import FlagDialog from '../FlagDialog'

jest.mock('@cf/hooks/useFeatureFlagTelemetry', () => ({
  useFeatureFlagTelemetry: jest.fn().mockImplementation(() => ({
    visitedPage: jest.fn(),
    createFeatureFlagStart: jest.fn(),
    createFeatureFlagCompleted: jest.fn()
  }))
}))

jest.mock('@common/hooks', () => ({
  useQueryParams: () => jest.fn(),
  useDeepCompareEffect: () => jest.fn()
}))

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

describe('FlagDialog', () => {
  test('it should fire telemetary event when Create Flag Dialog opened', () => {
    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FlagDialog disabled={false} environment="nonProduction" />
      </TestWrapper>
    )

    const createFlagButton = screen.getByText('cf.featureFlags.newFlag')
    expect(createFlagButton).toBeInTheDocument()

    fireEvent.click(createFlagButton)

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})

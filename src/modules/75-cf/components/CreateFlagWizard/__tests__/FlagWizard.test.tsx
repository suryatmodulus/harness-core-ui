import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import FlagWizard from '../FlagWizard'

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

describe('FlagWizard', () => {
  test('it should fire telementary event when completed created flag', () => {
    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FlagWizard
          flagTypeView="boolean"
          environmentIdentifier="nonProduction"
          toggleFlagType={jest.fn()}
          hideModal={jest.fn()}
          goBackToTypeSelections={jest.fn()}
        />
      </TestWrapper>
    )

    userEvent.type(screen.getByPlaceholderText('cf.creationModal.aboutFlag.ffNamePlaceholder'), 'TEST_FLAG')

    fireEvent.click(screen.getByText('next'))

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})

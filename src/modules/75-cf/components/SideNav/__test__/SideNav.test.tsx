import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import SideNav from '../SideNav'

jest.mock('@cf/hooks/useFeatureFlagTelemetry', () => ({
  useFeatureFlagTelemetry: jest.fn(() => ({
    visitedPage: jest.fn(),
    createFeatureFlagStart: jest.fn(),
    createFeatureFlagCompleted: jest.fn()
  }))
}))

jest.mock('@common/hooks', () => ({
  useQueryParams: () => jest.fn()
}))

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

describe('Sidenav', () => {
  beforeEach(() => localStorage.clear())

  test('it should render', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it should display the pipelines link only when pipelines are enabled', async () => {
    const Subject: React.FC = () => (
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )

    const { rerender } = render(<Subject />)
    expect(screen.queryByText('pipelines')).not.toBeInTheDocument()

    localStorage.setItem('FF_PIPELINES', 'true')
    rerender(<Subject />)
    expect(screen.getByText('pipelines')).toBeInTheDocument()
  })

  test('it should fire telementary event when Feature Flags menu item clicked', () => {
    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )

    const featureFlagLink = screen.getByText('featureFlagsText')
    expect(featureFlagLink).toBeInTheDocument()

    fireEvent.click(featureFlagLink)

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})

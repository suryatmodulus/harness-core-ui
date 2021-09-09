import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import * as hooks from '@common/hooks/useFeatureFlag'
import SideNav from '../SideNav'

jest.mock('@cf/hooks/useFeatureFlagTelemetry', () => ({
  useFeatureFlagTelemetry: jest.fn(() => ({
    visitedPage: jest.fn(),
    createFeatureFlagStart: jest.fn(),
    createFeatureFlagCompleted: jest.fn()
  }))
}))

jest.mock('@common/hooks/useQueryParams', () => ({
  useQueryParams: () => jest.fn()
}))

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

describe('Sidenav', () => {
  beforeEach(() => localStorage.clear())

  const Subject: React.FC<{ path?: string }> = ({
    path = '/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier'
  }) => (
    <TestWrapper path={path} pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
      <SideNav />
    </TestWrapper>
  )

  test('it should render', () => {
    const { container } = render(<Subject />)
    expect(container).toMatchSnapshot()
  })

  test('it should display the pipelines link only when pipelines are enabled', async () => {
    const { rerender } = render(<Subject />)
    expect(screen.queryByText('pipelines')).not.toBeInTheDocument()

    localStorage.setItem('FF_PIPELINES', 'true')
    rerender(<Subject />)
    expect(screen.getByText('pipelines')).toBeInTheDocument()
  })

  test('it should hide the Git Experience links when FF_GITSYNC is FALSE', async () => {
    jest.spyOn(hooks, 'useFeatureFlags').mockImplementation(() => ({ FF_GITSYNC: false }))

    render(
      <Subject path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/setup/access-control/users" />
    )

    expect(screen.queryByText('connectorsLabel')).not.toBeInTheDocument()
    expect(screen.queryByText('common.secrets')).not.toBeInTheDocument()
  })

  test('it should show the Git Experience links when FF_GITSYNC is TRUE', async () => {
    jest.spyOn(hooks, 'useFeatureFlags').mockImplementation(() => ({ FF_GITSYNC: true }))

    render(
      <Subject path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/setup/access-control/users" />
    )

    expect(screen.getByText('connectorsLabel')).toBeInTheDocument()
    expect(screen.queryByText('common.secrets')).toBeInTheDocument()
  })

  test('it should fire telementary event when Feature Flags menu item clicked', () => {
    render(<Subject />)

    const featureFlagLink = screen.getByText('featureFlagsText')
    expect(featureFlagLink).toBeInTheDocument()

    fireEvent.click(featureFlagLink)

    expect(useFeatureFlagTelemetry).toHaveBeenCalled()
  })
})

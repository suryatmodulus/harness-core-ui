/* eslint-disable react/display-name */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import * as cdNgServices from 'services/cd-ng'
import * as gitSync from '@cf/hooks/useGitSync'
import * as planEnforcement from '@cf/hooks/usePlanEnforcement'

import TargetGroupDetailPage from '../TargetGroupDetailPage'

jest.mock('@cf/components/AuditLogs/AuditLogs', () => ({
  AuditLogs: () => <span data-testid="audit-logs">Audit logs</span>
}))

jest.mock('@cf/components/TargetManagementToolbar/TargetManagementToolbar', () => ({
  __esModule: true,
  default: () => <span data-testid="target-management-toolbar">Target Management Toolbar</span>
}))

jest.mock('@cf/components/UsageLimitBanner/UsageLimitBanner', () => ({
  __esModule: true,
  default: () => <span data-testid="usage-limit-banner">Usage Limit Banner</span>
}))

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: 'Target_Group_1'
      }}
      queryParams={{ environment: 'dev' }}
    >
      <TargetGroupDetailPage />
    </TestWrapper>
  )

describe('TargetGroupDetailPage', () => {
  const useGetSegmentMock = jest.spyOn(cfServices, 'useGetSegment')
  const useGetEnvironmentMock = jest.spyOn(cdNgServices, 'useGetEnvironment')
  const useGitSyncMock = jest.spyOn(gitSync, 'useGitSync')
  const usePlanEnforcementMock = jest.spyOn(planEnforcement, 'default')

  beforeEach(() => {
    useGetSegmentMock.mockReturnValue({
      data: {
        createdAt: 1635935343546,
        environment: 'dev',
        excluded: [],
        identifier: 'Target_Group_1',
        included: [],
        name: 'Target Group 1',
        rules: []
      },
      refetch: jest.fn(),
      loading: false,
      error: null
    } as any)

    useGetEnvironmentMock.mockReturnValue({
      data: { data: { name: 'Environment Name' } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    useGitSyncMock.mockReturnValue({ isGitSyncActionsEnabled: false } as any)
    usePlanEnforcementMock.mockReturnValue({ isPlanEnforcementEnabled: false } as any)
  })

  describe('loading state', () => {
    test('it should show the loading spinner when the target group is loading', async () => {
      useGetSegmentMock.mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() } as any)

      renderComponent()

      expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
    })

    test('it should show the loading spinner when the env is loading', async () => {
      useGetEnvironmentMock.mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() } as any)

      renderComponent()

      expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
    })

    test('it should not show the loading spinner when target group and env are loaded', async () => {
      renderComponent()

      expect(screen.queryByTestId('container-spinner')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    test('it should show the error message if the target group call fails', async () => {
      const errorMessage = 'ERROR MESSAGE'
      useGetSegmentMock.mockReturnValue({
        data: null,
        loading: false,
        error: { message: errorMessage },
        refetch: jest.fn()
      } as any)

      renderComponent()

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    test('it should show the error message if the env call fails', async () => {
      const errorMessage = 'ERROR MESSAGE'
      useGetEnvironmentMock.mockReturnValue({
        data: null,
        loading: false,
        error: { message: errorMessage },
        refetch: jest.fn()
      } as any)

      renderComponent()

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    test('it should refetch both target group and env when the retry button is pressed', async () => {
      const refetchTargetGroupMock = jest.fn()
      const refetchEnvMock = jest.fn()

      useGetSegmentMock.mockReturnValue({
        data: null,
        loading: false,
        error: { message: 'error' },
        refetch: refetchTargetGroupMock
      } as any)
      useGetEnvironmentMock.mockReturnValue({
        data: null,
        loading: false,
        error: { message: 'error' },
        refetch: refetchEnvMock
      } as any)

      renderComponent()

      expect(refetchTargetGroupMock).not.toHaveBeenCalled()
      expect(refetchEnvMock).not.toHaveBeenCalled()

      userEvent.click(screen.getByRole('button', { name: 'Retry' }))

      await waitFor(() => {
        expect(refetchTargetGroupMock).toHaveBeenCalled()
        expect(refetchEnvMock).toHaveBeenCalled()
      })
    })
  })

  describe('gitSync', () => {
    test('it should not display the Target Management Toolbar when gitSync is disabled', async () => {
      renderComponent()

      expect(screen.queryByTestId('target-management-toolbar')).not.toBeInTheDocument()
    })

    test('it should display the Target Management Toolbar when gitSync is enabled', async () => {
      useGitSyncMock.mockReturnValue({ isGitSyncActionsEnabled: true } as any)

      renderComponent()

      expect(screen.getByTestId('target-management-toolbar')).toBeInTheDocument()
    })
  })

  describe('plan enforcement', () => {
    test('it should not display the Usage Limit Banner when plan enforcement is disabled', async () => {
      renderComponent()

      expect(screen.queryByTestId('usage-limit-banner')).not.toBeInTheDocument()
    })

    test('it should display the Usage Limit Banner when plan enforcement is enabled', async () => {
      usePlanEnforcementMock.mockReturnValue({ isPlanEnforcementEnabled: true } as any)

      renderComponent()

      expect(screen.getByTestId('usage-limit-banner')).toBeInTheDocument()
    })
  })

  describe('header', () => {
    test('it should display the name and created date of the Target Group', async () => {
      renderComponent()

      expect(screen.getByText('Target Group 1')).toBeInTheDocument()
      expect(screen.getByText('cf.targetDetail.createdOnDate')).toBeInTheDocument()
    })

    test('it should include a link back to the Target Groups listing page', async () => {
      renderComponent()

      expect(screen.getByRole('link', { name: 'cf.shared.targetManagement: cf.shared.segments' })).toBeInTheDocument()
    })
  })

  describe('main content tabs', () => {
    test('it should display the flag settings by default', async () => {
      renderComponent()

      expect(screen.getByRole('tab', { name: 'cf.targetDetail.flagSetting' })).toBeInTheDocument()
      expect(screen.getByTestId('flag-settings-panel')).toBeInTheDocument()
    })

    test('it should display the audit log when the appropriate tab is clicked', async () => {
      renderComponent()

      expect(screen.queryByTestId('audit-logs')).not.toBeInTheDocument()

      userEvent.click(screen.getByRole('tab', { name: 'activityLog' }))

      await waitFor(() => expect(screen.getByTestId('audit-logs')).toBeInTheDocument())
    })
  })
})

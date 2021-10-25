import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncActions, { GitSyncActionsProps } from '../GitSyncActions'

const renderComponent = (props?: Partial<GitSyncActionsProps>): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <GitSyncActions
        branch="test branch"
        repository="test repository"
        isAutoCommitEnabled={false}
        isLoading={false}
        handleToggleAutoCommit={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('GitSyncActions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should render correctly when auto commit = FALSE', async () => {
    renderComponent()

    expect(screen.getByText('test branch')).toBeInTheDocument()
    expect(screen.getByText('test repository')).toBeInTheDocument()

    expect(screen.getByTestId('auto-commit-status-icon')).toHaveClass('autoCommitDisabled')

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('Auto-commit to selected branch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).not.toBeChecked()
  })

  test('it should render correctly when auto commit = TRUE', async () => {
    renderComponent({ isAutoCommitEnabled: true })

    expect(screen.getByText('test branch')).toBeInTheDocument()
    expect(screen.getByText('test repository')).toBeInTheDocument()

    expect(screen.getByTestId('auto-commit-status-icon')).toHaveClass('autoCommitEnabled')

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('Auto-commit to selected branch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeChecked()
  })

  test('it should call handleAutoCommit callback when switch toggled to ON', async () => {
    const handleAutoCommitMock = jest.fn()

    renderComponent({ handleToggleAutoCommit: handleAutoCommitMock })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('auto-commit-switch'))

    expect(handleAutoCommitMock).toBeCalledWith(true)
  })

  test('it should call handleAutoCommit callback when switch toggled to OFF', async () => {
    const handleAutoCommitMock = jest.fn()

    renderComponent({ handleToggleAutoCommit: handleAutoCommitMock, isAutoCommitEnabled: true })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('auto-commit-switch'))

    expect(handleAutoCommitMock).toBeCalledWith(false)
  })

  test('it should show Git sync spinner when loading', async () => {
    renderComponent({ isLoading: true })

    expect(screen.getByTestId('git-sync-spinner')).toBeInTheDocument()
  })
})

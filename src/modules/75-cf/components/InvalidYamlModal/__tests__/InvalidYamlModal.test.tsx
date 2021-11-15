import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import InvalidYamlModal, { InvalidYamlModalProps } from '../InvalidYamlModal'

const renderComponent = (props: Partial<InvalidYamlModalProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <InvalidYamlModal
        handleRetry={jest.fn()}
        handleClose={jest.fn()}
        isLoading={false}
        apiError="default api error"
        flagsYamlFilename="flagsYamlFilename"
        {...props}
      />
    </TestWrapper>
  )
}

describe('InvalidYamlModal', () => {
  test('it should display error message correctly', async () => {
    renderComponent()

    expect(screen.getByTestId('invalid-yaml-dialog')).toBeInTheDocument()

    expect(screen.getByText(/default api error/i)).toBeInTheDocument()
    expect(screen.getByText('cf.gitSync.invalidYaml')).toBeInTheDocument()
    expect(screen.getByText('cf.gitSync.goToGit')).toBeInTheDocument()
  })

  test('it should call handleRetry correctly', async () => {
    const handleRetryMock = jest.fn()

    renderComponent({ handleRetry: handleRetryMock })

    await waitFor(() => expect(screen.getByText('cf.gitSync.tryAgain')).toBeInTheDocument())

    userEvent.click(screen.getByText('cf.gitSync.tryAgain'))

    expect(handleRetryMock).toHaveBeenCalled()
  })

  test('it should show loading spinner when loading', async () => {
    renderComponent({ isLoading: true })

    await waitFor(() => expect(document.querySelector('.bp3-spinner')).toBeInTheDocument())
  })
})

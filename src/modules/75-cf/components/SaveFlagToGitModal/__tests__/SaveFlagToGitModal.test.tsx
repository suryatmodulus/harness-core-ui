import React from 'react'
import { render, screen, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import SaveFlagToGitModal, { SaveFlagToGitModalProps } from '../SaveFlagToGitModal'

jest.mock('@cf/hooks/useGitSync', () => ({
  useGitSync: jest.fn(() => ({
    getGitSyncFormMeta: jest.fn().mockReturnValue({
      gitSyncInitialValues: {
        gitDetails: {
          branch: 'main',
          filePath: '/flags.yaml',
          repoIdentifier: 'harnesstest',
          rootFolder: './harness/',
          commitMsg: ''
        },
        autoCommit: false
      },
      gitSyncValidationSchema: {}
    }),
    isAutoCommitEnabled: false,
    isGitSyncEnabled: true,
    handleAutoCommit: jest.fn()
  }))
}))

const renderComponent = (props?: Partial<SaveFlagToGitModalProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SaveFlagToGitModal
        flagName="test 123"
        flagIdentifier="test123"
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}
describe('SaveFlagToGitModal', () => {
  test('it should render component with correct form values', async () => {
    renderComponent()

    expect(document.getElementsByName('gitDetails.repoIdentifier')[0]).toHaveValue('harnesstest')
    expect(document.getElementsByName('gitDetails.rootFolder')[0]).toHaveValue('./harness/')
    expect(document.getElementsByName('gitDetails.filePath')[0]).toHaveValue('/flags.yaml')
    expect(document.getElementsByName('gitDetails.branch')[0]).toHaveValue('main')
    expect(document.getElementsByName('gitDetails.commitMsg')[0]).toHaveValue('')

    expect(document.getElementsByName('flagName')[0]).toHaveValue('test 123')
  })

  test('it should submit the form with correct values', async () => {
    const onSubmitMock = jest.fn()

    renderComponent({ onSubmit: onSubmitMock })

    userEvent.type(screen.getByPlaceholderText('common.git.commitMessage'), 'this is my commit messsage')

    const saveButton = screen.getByText('save')
    expect(saveButton).toBeInTheDocument()

    userEvent.click(saveButton)

    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        autoCommit: false,
        gitDetails: {
          commitMsg: 'this is my commit messsage',
          repoIdentifier: 'harnesstest',
          rootFolder: './harness/',
          filePath: '/flags.yaml',
          branch: 'main'
        },
        flagIdentifier: 'test123',
        flagName: 'test 123'
      })
    )
  })
})

import React from 'react'
import { render, screen, waitFor, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import SaveFlagRepoDialogForm, { SaveFlagRepoDialogFormProps } from '../SaveFlagRepoDialogForm'

const renderComponent = (props: Partial<SaveFlagRepoDialogFormProps> = {}): RenderResult => {
  const componentProps = {
    initialFormData: props.initialFormData || {
      repoIdentifier: 'harnesstest',
      rootFolder: '',
      branch: 'main',
      filePath: 'flags.yaml'
    },
    repoSelectOptions: props.repoSelectOptions || [{ label: 'harnesstest', value: 'harnesstest' }],
    rootFolderSelectOptions: props.rootFolderSelectOptions || [
      { label: '/.harness/', value: '/.harness/' },
      { label: '/.testFolder/', value: '/.testFolder/' }
    ],
    handleRepoOptionChange: props.handleRepoOptionChange || jest.fn(),
    onSubmit: props.onSubmit || jest.fn(),
    onClose: props.onClose || jest.fn()
  }

  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SaveFlagRepoDialogForm {...componentProps} />
    </TestWrapper>
  )
}

describe('SaveFlagRepoDialogForm', () => {
  test('it should render with correct form data', async () => {
    renderComponent()

    expect(screen.getByTestId('save-flag-repo-dialog-form')).toHaveFormValues({
      repoIdentifier: 'harnesstest',
      branch: 'main',
      rootFolder: '',
      filePath: 'flags.yaml'
    })

    userEvent.click(document.getElementsByName('rootFolder')[0])
    expect(screen.getByText('/.testFolder/')).toBeInTheDocument()
    expect(screen.getByText('/.harness/')).toBeInTheDocument()
  })

  test('it should call onSubmit callback with correct values when button clicked', async () => {
    const onSubmitMock = jest.fn()

    renderComponent({ onSubmit: onSubmitMock })

    userEvent.click(document.getElementsByName('rootFolder')[0])
    userEvent.click(screen.getByText('/.testFolder/'))

    userEvent.click(screen.getByText('save'))

    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        branch: 'main',
        filePath: 'flags.yaml',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.testFolder/'
      })
    )
  })

  test('it should call onClose callback with cancel button clicked', async () => {
    const onCloseMock = jest.fn()

    renderComponent({ onClose: onCloseMock })

    userEvent.click(screen.getByText('cancel'))

    await waitFor(() => expect(onCloseMock).toHaveBeenCalled())
  })
})

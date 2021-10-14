import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import SaveFlagRepoStep, { SaveFlagRepoStepProps } from '../SaveFlagRepoStep'

jest.mock('services/cf', () => ({
  useGetGitRepo: jest.fn().mockReturnValue({
    loading: false,
    data: {
      repoDetails: {
        branch: 'main',
        filePath: '/flags.yaml',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/'
      }
    }
  })
}))

const renderComponent = (props?: Partial<SaveFlagRepoStepProps>): void => {
  const TOTAL_WIZARD_STEPS = (): number => 2

  render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SaveFlagRepoStep
        name="Create Boolean Flag Step 1"
        isLoadingCreateFeatureFlag={false}
        previousStep={jest.fn()}
        nextStep={jest.fn()}
        currentStep={TOTAL_WIZARD_STEPS}
        totalSteps={TOTAL_WIZARD_STEPS}
        prevStepData={{}}
        {...props}
      />
    </TestWrapper>
  )
}

describe('SaveFlagRepoStep', () => {
  test('it should render form data correctly', () => {
    const prevStepData = {
      name: 'test flag',
      identifier: 'testflag1234'
    }
    renderComponent({ prevStepData })

    expect(screen.getByTestId('save-flag-to-git-form')).toHaveFormValues({
      flagName: 'test flag',
      filePath: '/flags.yaml',
      rootFolder: '/.harness/'
    })

    expect(screen.getByText('testflag1234')).toBeInTheDocument()
    expect(screen.getByTestId('default-branch')).toHaveTextContent('main')
  })

  test('it should display "Save and Close" button if at end of wizard', async () => {
    const nextStepMock = jest.fn()

    renderComponent({ nextStep: nextStepMock })

    userEvent.type(screen.getByPlaceholderText('common.git.commitMessage'), 'this is my commit messsage')

    const nextButton = screen.getByText('cf.creationModal.saveAndClose')
    expect(nextButton).toBeInTheDocument()

    userEvent.click(nextButton)

    await waitFor(() =>
      expect(nextStepMock).toHaveBeenCalledWith({
        autoCommit: false,
        gitDetails: {
          commitMsg: 'this is my commit messsage'
        },
        filePath: '/flags.yaml',
        flagIdentifier: '',
        flagName: '',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/'
      })
    )
  })

  test('it should call previousStep callback on "back" click', () => {
    const previousStepMock = jest.fn()
    const previouStepDataMock = { name: 'test 1' }
    renderComponent({ previousStep: previousStepMock, prevStepData: previouStepDataMock })

    const backButton = screen.getByText('back')
    expect(backButton).toBeInTheDocument()

    userEvent.click(backButton)

    expect(previousStepMock).toHaveBeenCalledWith(previouStepDataMock)
  })
})

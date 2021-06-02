import React from 'react'
import { getAllByText, render, act, fireEvent, waitFor, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { EnableGitExperience } from './EnableGitExperience'

describe('<EnableGitExperience />', () => {
  test('should render EnableGitExperience component properly', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: -1
        }}
      >
        <EnableGitExperience />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on Enable Git Experience should display respective modal', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: -1
        }}
      >
        <EnableGitExperience />
      </TestWrapper>
    )

    const enableGitExpBtn = getAllByText(container, 'enableGitExperience')[1].parentElement as Element
    act(() => {
      fireEvent.click(enableGitExpBtn)
    })
    const portalDiv = document.getElementsByClassName('bp3-portal')[0] as HTMLElement
    await waitFor(() => expect(getAllByText(portalDiv, 'gitsync.configureHarnessFolder')).toHaveLength(2))
  })

  test('clicking on SKIP NOW should remove enable git exp popover', async () => {
    const { container, queryByTestId } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: -1
        }}
      >
        <EnableGitExperience />
      </TestWrapper>
    )

    const skipNowBtn = getByText(container, 'pipeline.gitExperience.skipNow').parentElement as Element
    await act(async () => {
      await fireEvent.click(skipNowBtn)
    })
    expect(queryByTestId(/pipeline.gitExperience.skipNow/i)).toBeNull()
  })
})

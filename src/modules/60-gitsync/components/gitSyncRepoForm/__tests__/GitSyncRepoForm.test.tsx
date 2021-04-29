import React from 'react'
import { render, waitFor, act, fireEvent, queryByAttribute } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoForm from '../GitSyncRepoForm'
import { gitHubMock } from './mockData'

const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve(gitHubMock))

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector }))
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Git Sync - repo tab', () => {
  test('rendering form to create gitSync repo', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    expect(container).toMatchSnapshot()
  })

  test('Repo type card should be enabled only for Github', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    const gitHubCard = queryByAttribute('data-testid', container, 'Github-card')
    const gitLabCard = queryByAttribute('data-testid', container, 'Gitlab-card')

    expect(gitHubCard?.classList.contains('Card--interactive')).toBe(true)
    expect(gitHubCard?.classList.contains('Card--disabled')).toBe(false)
    expect(gitLabCard?.classList.contains('Card--interactive')).toBe(false)
    expect(gitLabCard?.classList.contains('Card--disabled')).toBe(true)

    await act(async () => {
      fireEvent.click(gitLabCard!)
    })
    //selected card should not change
    expect(container).toMatchSnapshot()
  })

  test('Filling gitSync repo form', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })

    const connnectorRefInput = queryByAttribute('data-testid', container, /gitConnector/)
    expect(connnectorRefInput).toBeDefined()
    fireEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0]
      expect(connectorSelectorDialog).toMatchSnapshot('connectorSelectorDialog')
      // const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      // expect(githubConnector).toBeTruthy()
      // fireEvent.click(githubConnector?.[0])
    })

    expect(container).toMatchSnapshot('gitSync repo form')
  })
})

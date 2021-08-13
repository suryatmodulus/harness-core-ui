import React from 'react'
import { render, waitFor, act, fireEvent, queryByAttribute, findAllByText, findByText } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import GitSyncRepoForm from '../GitSyncRepoForm'
import { gitHubMock } from './mockData'

const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve({}))

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector })),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(gitHubMock)),
  getListOfBranchesByConnectorPromise: jest
    .fn()
    .mockResolvedValue({ data: ['master', 'devBranch'], status: 'SUCCESS' }),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn }))
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
          gitSyncRepoInfo={{ branch: 'branch', gitConnectorType: 'Github' }}
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
    // const gitLabCard = queryByAttribute('data-testid', container, 'Gitlab-card')

    expect(gitHubCard?.classList.contains('Card--interactive')).toBe(true)
    expect(gitHubCard?.classList.contains('Card--disabled')).toBe(false)
    // expect(gitLabCard?.classList.contains('Card--interactive')).toBe(false)
    // expect(gitLabCard?.classList.contains('Card--disabled')).toBe(true)

    // await act(async () => {
    //   fireEvent.click(gitLabCard!)
    // })
    //selected card should not change
    expect(container).toMatchSnapshot()
  })

  test('Filling gitSync repo form', async () => {
    const { container, getByText, queryByText } = render(
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
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(connectorSelectorDialog).toMatchSnapshot('connectorSelectorDialog')
      expect(githubConnector).toBeTruthy()
      fireEvent.click(githubConnector?.[0])
      const applySelected = getByText('entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })

    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeDefined()

    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'repoName' } })
    })

    const rootfolderInput = queryByAttribute('name', container, 'rootfolder')
    expect(rootfolderInput).toBeDefined()

    await act(async () => {
      fireEvent.change(rootfolderInput!, { target: { value: 'src' } })
    })

    const icons = container.querySelectorAll('[icon="chevron-down"]')
    const branchInputIcon = icons[icons.length - 1]
    expect(branchInputIcon).toBeDefined()

    act(() => {
      fireEvent.click(branchInputIcon!)
    })

    await waitFor(() => expect(queryByText('devBranch')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('devBranch'))
    })

    expect(container).toMatchSnapshot('gitSync repo form')

    const submitBtn = await findByText(container, 'save')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(createGitSynRepo).toBeCalledTimes(1)
      expect(createGitSynRepo).toHaveBeenCalledWith({
        branch: 'devBranch',
        gitConnectorRef: 'ValidGithubRepo',
        gitConnectorType: 'Github',
        gitSyncFolderConfigDTOs: [
          {
            isDefault: true,
            rootFolder: 'src/.harness/'
          }
        ],
        identifier: 'repoName',
        name: 'repoName',
        orgIdentifier: 'default',
        projectIdentifier: 'dummyProject',
        repo: 'https://github.com/wings-software/sunnykesh-gitSync'
      })
    })
  })
})

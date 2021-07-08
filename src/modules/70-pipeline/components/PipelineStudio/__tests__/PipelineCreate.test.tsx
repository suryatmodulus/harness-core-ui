import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { gitConfigs, sourceCodeManagers, branchStatusMock } from '@connectors/mocks/mock'
import PipelineCreate from '../CreateModal/PipelineCreate'
import type { PipelineCreateProps } from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'

const afterSave = jest.fn()
const closeModal = jest.fn()

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const getEditProps = (
  identifier = 'test',
  description = 'desc',
  name = 'pipeline',
  repo = '',
  branch = ''
): PipelineCreateProps => ({
  afterSave,
  initialValues: { identifier, description, name, repo, branch },
  closeModal
})

describe('PipelineCreate test', () => {
  test('initializes ok for CI module', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: -1
        }}
      >
        <PipelineCreate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const nameInput = container.querySelector('[name="name"]')
    expect(nameInput).not.toBeNull()
    const collpase = container.querySelector('.Collapse--main')?.querySelector('.CollapseHeader--leftSection')
    expect(collpase).not.toBeNull()
    const submit = container.getElementsByTagName('button')[0]
    await act(async () => {
      fireEvent.change(nameInput as Element, 'Sample Pipeline')
      fireEvent.click(submit)
    })
    await waitFor(() => nameInput?.getAttribute('value') == 'Sample Pipeline')
    if (collpase) {
      await act(async () => {
        fireEvent.click(collpase)
      })

      expect(container.querySelector('.Collapse--main')).not.toBeNull()
    }
  })
  test('initializes ok for CD module', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: -1
        }}
      >
        <PipelineCreate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const nameInput = container.querySelector('[name="name"]')
    expect(nameInput).not.toBeNull()
    const collpase = container.querySelector('.Collapse--main')?.querySelector('.CollapseHeader--leftSection')
    expect(collpase).not.toBeNull()
    const submit = container.getElementsByTagName('button')[0]
    await act(async () => {
      fireEvent.change(nameInput as Element, 'Sample Pipeline')
      fireEvent.click(submit)
    })
    await waitFor(() => nameInput?.getAttribute('value') == 'Sample Pipeline')
    if (collpase) {
      await act(async () => {
        fireEvent.click(collpase)
      })

      expect(container.querySelector('.Collapse--main')).not.toBeNull()
    }
  })
  test('initializes ok edit pipeline', async () => {
    afterSave.mockReset()
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/:pipelineIdentifier/"
        pathParams={{
          accountId: 'dummy',
          pipelineIdentifier: 'test'
        }}
      >
        <PipelineCreate {...getEditProps()} />
      </TestWrapper>
    )
    await waitFor(() => getByText('save'))
    expect(container).toMatchSnapshot()
    const saveBtn = getByText('save')
    fireEvent.click(saveBtn)
    await waitFor(() => expect(afterSave).toBeCalledTimes(1))
    expect(afterSave).toBeCalledWith(
      {
        description: 'desc',
        identifier: 'test',
        name: 'pipeline'
      },
      undefined
    )
    const closeBtn = getByText('cancel')
    fireEvent.click(closeBtn!)
    await waitFor(() => expect(closeModal).toBeCalledTimes(1))
    expect(closeModal).toBeCalled()
  })
  test('initializes ok new pipeline', async () => {
    closeModal.mockReset()
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard"
        pathParams={{
          accountId: 'dummy'
        }}
      >
        <PipelineCreate {...getEditProps(DefaultNewPipelineId)} />
      </TestWrapper>
    )
    await waitFor(() => getByText('start'))
    expect(container).toMatchSnapshot()
  })

  test('when git exp is enabled - pipeline create modal should take repo and branch to save pipeline to', async () => {
    afterSave.mockReset()
    closeModal.mockReset()
    const initialPipelineCreateData = {
      identifier: '-1',
      name: 'Pipeline 1',
      description: 'abc',
      repo: 'git_sync',
      branch: 'test_branch'
    }
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:ordIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/pipeline-studio/"
        pathParams={{
          accountId: 'dummy',
          ordIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: -1,
          module: 'cd'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <PipelineCreate initialValues={initialPipelineCreateData} afterSave={afterSave} closeModal={closeModal} />
      </TestWrapper>
    )

    await waitFor(() => getByText('start'))
    expect(getByText('COMMON.GITSYNC.GITREPOSITORYDETAILS')).not.toBeNull()
    expect(getByText('common.git.selectRepoLabel')).not.toBeNull()
    expect(getByText('common.gitSync.selectBranchLabel')).not.toBeNull()

    // @TODO: Make this working, without this there is not real test case here
    // loadingRepos is coming as true always and because of that
    // there are not repos in the repo dropdown in GitContextForm component and that in turn is not allowing Start button click

    // const startBtn = getElementByText('start').parentElement
    // act(() => {
    //   fireEvent.click(startBtn!)
    // })
    // await waitFor(() => expect(afterSave).toBeCalledTimes(1))
    // expect(afterSave).toBeCalledWith(initialPipelineCreateData, {
    //   repoIdentfier: initialPipelineCreateData.repo,
    //   branch: initialPipelineCreateData.branch
    // })

    const cancelBtn = getByText('cancel').parentElement
    act(() => {
      fireEvent.click(cancelBtn!)
    })
    await waitFor(() => expect(closeModal).toBeCalledTimes(1))
  })
})

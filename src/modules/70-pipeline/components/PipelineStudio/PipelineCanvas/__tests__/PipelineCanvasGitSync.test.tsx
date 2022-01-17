/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { fireEvent, render, act, getByText, waitFor } from '@testing-library/react'

import routes from '@common/RouteDefinitions'
import { useMutateAsGet } from '@common/hooks'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { ConnectorResponse } from '@pipeline/components/InputSetForm/__tests__/InputSetMocks'
import { createPipelinePromise, putPipelinePromise } from 'services/pipeline-ng'
import { PipelineCanvas } from '../PipelineCanvas'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import pipelineContextMock, { putPipelinePromiseArg, createPipelinePromiseArg } from './PipelineCanvasGitSyncTestHelper'
import { DefaultNewPipelineId } from '../../PipelineContext/PipelineActions'
import { mockPipelineTemplateYaml } from './PipelineCanvasTestHelper'

jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn(() => Promise.resolve(new Map())),
  useValidationError: () => ({ errorMap: new Map() })
}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useCreateVariables: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } })),
    loading: false,
    cancel: jest.fn()
  }))
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, refetch: getListGitSync, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const PipelineCanvasTestWrapper: React.FC<{ modifiedPipelineContextMock: any; pipelineIdentifier: string }> = ({
  modifiedPipelineContextMock,
  pipelineIdentifier
}) => {
  return (
    <PipelineContext.Provider value={modifiedPipelineContextMock}>
      <GitSyncTestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'default',
          projectIdentifier: 'testProject',
          pipelineIdentifier,
          module: 'cd'
        }}
        queryParams={{
          repoIdentifier: 'identifier',
          branch: 'feature'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <PipelineCanvas
          toPipelineStudio={routes.toPipelineStudio}
          toPipelineDetail={routes.toPipelineDetail}
          toPipelineList={routes.toPipelines}
          toPipelineProject={routes.toDeployments}
        />
      </GitSyncTestWrapper>
    </PipelineContext.Provider>
  )
}

describe('PipelineCanvas tests', () => {
  describe('When Git Sync is enabled', () => {
    describe('Edit Pipeline', () => {
      beforeEach(() => {
        // eslint-disable-next-line
        // @ts-ignore
        useMutateAsGet.mockImplementation(() => {
          return mockPipelineTemplateYaml
        })
      })
      test('should render pipeline canvas in edit mode', async () => {
        const { getByText: getElementByText, getByTestId } = render(
          <PipelineCanvasTestWrapper
            modifiedPipelineContextMock={pipelineContextMock}
            pipelineIdentifier={'test_pipeline'}
          />
        )
        const pipelineName = getElementByText('Test Pipeline')
        expect(pipelineName).toBeInTheDocument()

        const gitPopoverIcon = getByTestId('git-popover')
        act(() => {
          fireEvent.mouseEnter(gitPopoverIcon)
        })
        await waitFor(() => expect(getElementByText('/rootFolderTest/.harness/test_pipeline.yaml')).toBeInTheDocument())

        const branchSelector = document.querySelector('input[name="branch"]') as HTMLInputElement
        expect(branchSelector.value).toBe('feature')

        const visualToggle = getElementByText('VISUAL')
        const yamlToggle = getElementByText('YAML')
        expect(visualToggle).toBeInTheDocument()
        expect(yamlToggle).toBeInTheDocument()

        const unsavedChangesTag = getElementByText('unsavedChanges')
        expect(unsavedChangesTag).toBeInTheDocument()

        const saveBtn = getElementByText('save')
        const discardBtn = getElementByText('pipeline.discard')
        const runBtn = getElementByText('runPipelineText')
        expect(saveBtn).toBeInTheDocument()
        expect(discardBtn).toBeInTheDocument()
        expect(runBtn).toBeInTheDocument()
      })

      test('clicking on save button should display Save To Git modal for edit mode', async () => {
        await act(async () => {
          const { container } = render(
            <PipelineCanvasTestWrapper
              modifiedPipelineContextMock={pipelineContextMock}
              pipelineIdentifier={'test_pipeline'}
            />
          )

          const saveBtn = getByText(container, 'save').parentElement
          expect(saveBtn).toBeInTheDocument()
          fireEvent.click(saveBtn!)
          let saveToGitSaveBtn: HTMLElement
          await waitFor(() => {
            const portalDiv = document.getElementsByClassName('bp3-portal')[0] as HTMLElement
            const savePipelinesToGitHeader = getByText(portalDiv, 'common.git.saveResourceLabel')
            expect(savePipelinesToGitHeader).toBeInTheDocument()

            const nameInput = document.querySelector('input[name="name"]')
            expect(nameInput).toBeDisabled()
            expect(nameInput?.getAttribute('value')).toBe('Test Pipeline')

            const repoIdentifierInput = document.querySelector('input[name="repoIdentifier"]')
            expect(repoIdentifierInput).toBeDisabled()
            expect(repoIdentifierInput?.getAttribute('value')).toBe('gitSyncRepo')

            const folderInput = document.querySelector('input[name="rootFolder"]')
            expect(folderInput).toBeDisabled()
            expect(folderInput?.getAttribute('value')).toBe('/rootFolderTest/.harness/')

            const filePathInput = document.querySelector('input[name="filePath"]')
            expect(filePathInput).toBeDisabled()
            expect(filePathInput?.getAttribute('value')).toBe('test_pipeline.yaml')

            const commitMsgTextArea = document.querySelector('textarea[name="commitMsg"]')
            expect(commitMsgTextArea).not.toBeDisabled()
            expect(commitMsgTextArea?.innerHTML).toBe('common.gitSync.updateResource')

            const commitToAnExistingBranch = getByText(portalDiv, 'common.git.existingBranchCommitLabel')
            expect(commitToAnExistingBranch).toBeDefined()
            const currentBranch = getByText(portalDiv, 'feature')
            expect(currentBranch).toBeDefined()

            saveToGitSaveBtn = getByText(portalDiv, 'save').parentElement as HTMLElement
            expect(saveToGitSaveBtn).toBeInTheDocument()
          })
          fireEvent.click(saveToGitSaveBtn!)
          await waitFor(() => expect(putPipelinePromise).toHaveBeenCalled())
          expect(putPipelinePromise).toHaveBeenCalledWith(putPipelinePromiseArg)
        })
      })
    })

    describe('Create Pipeline', () => {
      beforeEach(() => {
        delete pipelineContextMock.state.gitDetails.filePath
        delete pipelineContextMock.state.gitDetails.objectId

        // eslint-disable-next-line
        // @ts-ignore
        useMutateAsGet.mockImplementation(() => {
          return mockPipelineTemplateYaml
        })
      })

      test('should render pipeline canvas in create mode', async () => {
        const { getByText: getElementByText, getByTestId } = render(
          <PipelineCanvasTestWrapper
            modifiedPipelineContextMock={pipelineContextMock}
            pipelineIdentifier={DefaultNewPipelineId}
          />
        )
        const pipelineName = getElementByText('Test Pipeline')
        expect(pipelineName).toBeInTheDocument()

        const gitPopoverIcon = getByTestId('git-popover')
        act(() => {
          fireEvent.mouseEnter(gitPopoverIcon)
        })
        await waitFor(() => expect(getElementByText('gitSyncRepo')).toBeInTheDocument())

        const branchName = getElementByText('feature')
        expect(branchName).toBeInTheDocument()

        const visualToggle = getElementByText('VISUAL')
        const yamlToggle = getElementByText('YAML')
        expect(visualToggle).toBeInTheDocument()
        expect(yamlToggle).toBeInTheDocument()

        const unsavedChangesTag = getElementByText('unsavedChanges')
        expect(unsavedChangesTag).toBeInTheDocument()

        const saveBtn = getElementByText('save')
        const runBtn = getElementByText('runPipelineText')
        expect(saveBtn).toBeInTheDocument()
        expect(runBtn).toBeInTheDocument()
      })

      test('clicking on save button should display Save To Git modal for create mode', async () => {
        await act(async () => {
          const { container } = render(
            <PipelineCanvasTestWrapper
              modifiedPipelineContextMock={pipelineContextMock}
              pipelineIdentifier={DefaultNewPipelineId}
            />
          )
          const saveBtn = getByText(container, 'save').parentElement
          expect(saveBtn).toBeInTheDocument()
          fireEvent.click(saveBtn!)
          let saveToGitSaveBtn: HTMLElement
          await waitFor(() => {
            const portalDiv = document.getElementsByClassName('bp3-portal')[0] as HTMLElement
            const savePipelinesToGitHeader = getByText(portalDiv, 'common.git.saveResourceLabel')
            expect(savePipelinesToGitHeader).toBeInTheDocument()

            const nameInput = document.querySelector('input[name="name"]')
            expect(nameInput).toBeDisabled()
            expect(nameInput?.getAttribute('value')).toBe('Test Pipeline')

            const repoIdentifierInput = document.querySelector('input[name="repoIdentifier"]')
            expect(repoIdentifierInput).toBeDisabled()
            expect(repoIdentifierInput?.getAttribute('value')).toBe('gitSyncRepo')

            const folderInput = document.querySelector('input[name="rootFolder"]')
            expect(folderInput).not.toBeDisabled()
            expect(folderInput?.getAttribute('value')).toBe('/rootFolderTest/.harness/')

            const filePathInput = document.querySelector('input[name="filePath"]')
            expect(filePathInput).not.toBeDisabled()
            expect(filePathInput?.getAttribute('value')).toBe('test_pipeline.yaml')

            const commitMsgTextArea = document.querySelector('textarea[name="commitMsg"]')
            expect(commitMsgTextArea).not.toBeDisabled()
            expect(commitMsgTextArea?.innerHTML).toBe('common.gitSync.createResource')

            const commitToAnExistingBranch = getByText(portalDiv, 'common.git.existingBranchCommitLabel')
            expect(commitToAnExistingBranch).toBeDefined()
            const currentBranch = getByText(portalDiv, 'feature')
            expect(currentBranch).toBeDefined()

            saveToGitSaveBtn = getByText(portalDiv, 'save').parentElement as HTMLElement
            expect(saveToGitSaveBtn).toBeInTheDocument()
          })
          fireEvent.click(saveToGitSaveBtn!)
          await waitFor(() => expect(createPipelinePromise).toHaveBeenCalled())
          expect(createPipelinePromise).toHaveBeenCalledWith(createPipelinePromiseArg)
        })
      })
    })
  })
})

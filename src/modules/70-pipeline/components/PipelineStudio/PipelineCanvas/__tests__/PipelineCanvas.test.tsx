import React from 'react'
import { useParams } from 'react-router-dom'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { putPipelinePromise, createPipelinePromise } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'

import { PipelineCanvas, PipelineCanvasProps } from '../PipelineCanvas'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { DefaultNewPipelineId, DrawerTypes } from '../../PipelineContext/PipelineActions'
import { getDummyPipelineCanvasContextValue, mockApiDataEmpty } from './PipelineCanvasTestHelper'

const getProps = (): PipelineCanvasProps => ({
  toPipelineStudio: jest.fn(),
  toPipelineDetail: jest.fn(),
  toPipelineList: jest.fn(),
  toPipelineProject: jest.fn()
})

/* Mocks */
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn().mockReturnValue({ error: { size: 2 } })
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
jest.mock('framework/GitRepoStore/GitSyncStoreContext', () => ({
  useGitSyncStore: jest.fn().mockReturnValue({ gitSyncRepos: [{ identifier: 'repoIdentifier', name: 'repoName' }] })
}))
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn(),
  createPipelinePromise: jest.fn(),
  useGetInputsetYaml: () => jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: { data: {} }, refetch: jest.fn(), error: null, loading: false }
  })
}))

const showError = jest.fn()
const showSuccess = jest.fn()
const toasterClear = jest.fn()
jest.mock('@common/components/Toaster/useToaster', () => ({
  useToaster: jest.fn(() => ({ showError, showSuccess, clear: toasterClear }))
}))

/* Mocks end */

describe('Pipeline Canvas - new pipeline', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { pipelineIdentifier: DefaultNewPipelineId }
    })
  })
  test('function calls on switch to YAML mode and back to VISUAL', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    putPipelinePromise.mockResolvedValue(mockApiDataEmpty)
    // eslint-disable-next-line
    // @ts-ignore
    createPipelinePromise.mockResolvedValue(mockApiDataEmpty)

    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    const { getByText, queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // toggle to YAMl works
    act(() => {
      fireEvent.click(getByText('yaml'))
    })
    expect(contextValue.updatePipelineView).toBeCalledWith({
      splitViewData: {},
      isDrawerOpened: false,
      isYamlEditable: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    expect(contextValue.setView).toBeCalledWith('YAML')
    expect(contextValue.setSelectedStageId).toBeCalledWith(undefined)
    expect(contextValue.setSelectedSectionId).toBeCalledWith(undefined)

    // Click on VISUAL again
    act(() => {
      fireEvent.click(getByText('visual'))
    })
    expect(contextValue.setView).toHaveBeenLastCalledWith('VISUAL')
    expect(queryByText('save')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('save'))
    })
    expect(contextValue.setSchemaErrorView).toBeCalledWith(false)
    await waitFor(() => expect(contextValue.deletePipelineCache).toBeCalled())
    expect(showSuccess).toBeCalled()
    expect(contextValue.fetchPipeline).toBeCalledWith({
      forceFetch: true,
      forceUpdate: true,
      newPipelineId: 'Pipeline'
    })
    expect(props.toPipelineStudio).toBeCalled()
  })

  test('loading state', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: true })
    const { queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('common.loading')).toBeTruthy()
  })

  test('with git sync enabled - new pipeline', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: { repoIdentifier: 'repoIdentifier', rootFolder: 'rootFolder', filePath: 'filePath', branch: 'branch' }
    })
    const { queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('repoName')).toBeTruthy()
    expect(queryByText('branch')).toBeTruthy()
    expect(queryByText('rootFolderfilePath')).toBeNull()
  })

  test('readonly mode', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: true
    })
    const { queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('common.readonlyPermissions')).toBeTruthy()
    expect(queryByText('save')).toBeNull()
  })

  test('isUpdated true and execute permissions', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: false,
      isUpdated: true
    })
    const dummyPermissionsMap = new Map()
    dummyPermissionsMap.set('EXECUTE_PIPELINE', true)
    const { queryByText } = render(
      <TestWrapper defaultPermissionValues={{ permissions: dummyPermissionsMap }}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('unsavedChanges')).toBeTruthy()
  })
})

describe('Existing pipeline', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { pipelineIdentifier: 'someId' }
    })
  })
  test('discard button if existing pipeline is touched', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: false,
      isUpdated: true
    })
    const { queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('unsavedChanges')).toBeTruthy()
  })
})

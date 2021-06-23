import React from 'react'
import { render, waitFor, fireEvent, createEvent, act } from '@testing-library/react'
import { noop } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  pipelineModuleParams,
  inputSetFormPathProps,
  pipelinePathProps
} from '@common/utils/routeUtils'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { OverlayInputSetForm } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { EnhancedInputSetForm } from '../InputSetForm'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit
} from './InputSetMocks'

const eventData = { dataTransfer: { setData: jest.fn(), dropEffect: '', getData: () => '1' } }

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock(
  '@common/components/YAMLBuilder/YamlBuilder',
  () => ({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }) => {
    const handler = React.useMemo(
      () =>
        ({
          getLatestYaml: () => GetInputSetEdit.data?.data?.inputSetYaml || '',
          getYAMLValidationErrorMap: () => new Map()
        } as YamlBuilderHandlerBinding),
      []
    )

    React.useEffect(() => {
      bind?.(handler)
    }, [bind, handler])
    return (
      <div>
        <span>Yaml View</span>
        {children}
      </div>
    )
  }
)

jest.useFakeTimers()

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop)
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useCreateVariables: () => jest.fn(() => ({})),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn(() => ({})),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetSchemaYaml: jest.fn(() => ({}))
}))

const TEST_INPUT_SET_PATH = routes.toInputSetList({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

describe('Render Forms - Snapshot Testing', () => {
  test('render Input Set Form view', async () => {
    const { getByText, container } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: '-1',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider
          value={
            {
              state: { pipeline: { name: '', identifier: '' } } as any,
              getStageFromPipeline: jest.fn((_stageId, pipeline) => ({ stage: pipeline.stages[0], parent: undefined }))
            } as any
          }
        >
          <EnhancedInputSetForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    // // Switch Mode
    // fireEvent.click(getByText('yaml'))
    // await waitFor(() => getAllByText('Yaml View'))
    // // Switch Mode
    // fireEvent.click(getByText('visual'))
    // const stages = container.querySelector('.header')
    // fireEvent.click(stages as Element)
    // Close Form
    fireEvent.click(getByText('cancel'))
    expect(container).toMatchSnapshot()
  })

  test('render Overlay Input Set Form view', async () => {
    const { getAllByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OverlayInputSetForm hideForm={jest.fn()} />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    const container = findDialogContainer()
    await waitFor(() => getAllByText('inputSets.addInputSetPlus'))
    const addNew = getAllByText('inputSets.addInputSetPlus')[0]
    // Add two
    fireEvent.click(addNew)
    fireEvent.click(addNew)
    // Remove the last
    const remove = container?.querySelectorAll('[icon="delete"]')[1]
    fireEvent.click(remove!)
    expect(container).toMatchSnapshot()
  })

  test('render Edit Input Set Form view', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: 'asd',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider
          value={
            {
              state: { pipeline: { name: '', identifier: '' } } as any,
              getStageFromPipeline: jest.fn((_stageId, pipeline) => ({ stage: pipeline.stages[0], parent: undefined }))
            } as any
          }
        >
          <EnhancedInputSetForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    // const stagePanel = container.querySelector('[data-testid="Stage.asd-summary"]')
    // act(() => {
    //   fireEvent.click(stagePanel as Element)
    // })
    // const infraPanel = container.querySelector('[data-testid="Stage.asd.Infrastructure-summary"]')
    // fireEvent.click(infraPanel as Element)
    expect(container).toMatchSnapshot('expanded')
    await waitFor(() => getAllByText('tesa1'))
    fireEvent.click(getByText('save'))
    // Switch Mode
    fireEvent.click(getByText('yaml'))
    await waitFor(() => getAllByText('Yaml View'))
    fireEvent.click(getByText('save'))
    expect(container).toMatchSnapshot()
  })

  test('render Edit Overlay Input Set Form view', async () => {
    const { getAllByText, getByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    const container = findDialogContainer()
    await waitFor(() => getAllByText('2.'))
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('save'))
    // Switch Mode
    fireEvent.click(getByText('yaml'))
    await waitFor(() => getAllByText('Yaml View'))
    fireEvent.click(getByText('save'))
  })

  test('render Edit Overlay Input Set Form and test drag drop', async () => {
    const { getByTestId } = render(
      <TestWrapper
        path={TEST_INPUT_SET_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    await waitFor(() => getByTestId('asd'))

    const container = getByTestId('asd')
    const container2 = getByTestId('test')

    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(container), eventData)

      fireEvent(container, dragStartEvent)
      expect(container).toMatchSnapshot()

      fireEvent.dragEnd(container)
      expect(container).toMatchSnapshot()

      fireEvent.dragLeave(container)

      const dropEffectEvent = Object.assign(createEvent.dragOver(container), eventData)
      fireEvent(container2, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(container), eventData)
      fireEvent(container2, dropEvent)
    })
  })
})

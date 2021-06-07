import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, inputSetFormPathProps } from '@common/utils/routeUtils'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
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

const errorResponse = (): Promise<{ status: string }> =>
  Promise.resolve({
    status: 'ERROR',
    data: {
      errorResponse: true,
      inputSetErrorWrapper: {
        uuidToErrorResponseMap: {
          field1: { errors: [{ fieldName: 'field1', message: 'field1 error message' }] },
          field2: { errors: [{ fieldName: 'field2', message: 'field2 error message' }] }
        }
      }
    }
  })

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

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useCreateVariables: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS'
        }
      })
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn().mockImplementation(() => ({ errorResponse })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetYamlSchema: jest.fn(() => ({}))
}))

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

describe('Input Set - error scenarios', () => {
  test('if API errors are displayed in yellow accordion', async () => {
    const { getAllByText, getByText, queryByText } = render(
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
    await waitFor(() => getAllByText('tesa1'))
    fireEvent.click(getByText('save'))
    await waitFor(() => expect(queryByText('2 problems with Input Set')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('2 problems with Input Set'))
    })
    expect(queryByText('field1: field1 error message (1)'))
    expect(queryByText('field2: field2 error message (3)'))
  })
})

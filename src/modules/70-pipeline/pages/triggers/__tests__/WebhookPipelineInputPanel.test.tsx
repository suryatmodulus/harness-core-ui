import React from 'react'
import { render, waitFor, queryByAttribute } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import * as pipelineNg from 'services/pipeline-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import {
  GetTemplateFromPipelineResponse,
  GetTemplateStageVariablesFromPipelineResponse,
  GetTemplateFromPipelineResponseEmpty,
  GetMergeInputSetFromPipelineTemplateWithListInputResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetEnvironmentList
} from './sharedMockResponses'
import { getTriggerConfigDefaultProps, pipelineInputInitialValues } from './webhookMockConstants'
import WebhookPipelineInputPanel from '../views/WebhookPipelineInputPanel'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest.fn(() => GetEnvironmentList),
  useGetConnector: jest.fn(() => ConnectorResponse),
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

const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper
      path="/account/:accountId/org/:orgIdentifier/project/:projectIdentifier"
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId'
      }}
    >
      <Formik initialValues={pipelineInputInitialValues} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        {formikProps => (
          <FormikForm>
            <PipelineContext.Provider
              value={
                {
                  state: { pipeline: { name: '', identifier: '' } } as any,
                  getStageFromPipeline: jest.fn((_stageId, pipeline) => ({
                    stage: pipeline.stages[0],
                    parent: undefined
                  }))
                } as any
              }
            >
              <WebhookPipelineInputPanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
            </PipelineContext.Provider>
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('WebhookPipelineInputPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Pipeline Input Panel with no inputs', async () => {
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponseEmpty as UseGetReturn<any, any, any, any>)

      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)

      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)

      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('pipeline.triggers.pipelineInputLabel')).toBeTruthy())
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Pipeline Input Panel with pipeline variable runtime inputs', async () => {
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)

      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)

      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('pipeline.triggers.pipelineInputLabel')).toBeTruthy())
      await waitFor(() =>
        queryByAttribute('placeholder', container, 'pipeline.infraSpecifications.namespacePlaceholder')
      )
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Pipeline Input Panel with two runtime inputs', async () => {
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateStageVariablesFromPipelineResponse as UseGetReturn<any, any, any, any>)

      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)

      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('pipeline.triggers.pipelineInputLabel')).toBeTruthy())
      await waitFor(() =>
        queryByAttribute('placeholder', container, 'pipeline.infraSpecifications.namespacePlaceholder')
      )
      expect(container).toMatchSnapshot()
    })
  })
})

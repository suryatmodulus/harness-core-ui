import React from 'react'
import { render, waitFor, queryByAttribute } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import * as pipelineNg from 'services/pipeline-ng'
import strings from 'strings/strings.en.yaml'
import { PipelineContext } from '@pipeline/exports'
import { TestWrapper } from '@common/utils/testUtils'
import {
  GetTemplateFromPipelineResponse,
  GetTemplateFromPipelineResponseEmpty,
  GetMergeInputSetFromPipelineTemplateWithListInputResponse,
  ConnectorResponse,
  GetInputSetsResponse
} from './sharedMockResponses'
import { getTriggerConfigDefaultProps, pipelineInputInitialValues } from './webhookMockConstants'
import WebhookPipelineInputPanel from '../views/WebhookPipelineInputPanel'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

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
      <Formik initialValues={pipelineInputInitialValues} onSubmit={() => undefined}>
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
      await waitFor(() => expect(strings['pipeline-triggers'].pipelineInputLabel).toBeTruthy())
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Pipeline Input Panel with two runtime inputs', async () => {
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
      await waitFor(() => expect(strings['pipeline-triggers'].pipelineInputLabel).toBeTruthy())
      await waitFor(() => queryByAttribute('placeholder', container, 'cd.steps.common.namespacePlaceholder'))
      expect(container).toMatchSnapshot()
    })
  })
})

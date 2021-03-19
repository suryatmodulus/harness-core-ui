import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { useStrings } from 'framework/exports'
import * as pipelineNg from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import * as cdng from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import {
  GetSourceRepoToEventResponse,
  GetActionsListResponse,
  GetActionsListPushEventResponse,
  GetTriggerResponse,
  GetTriggerRepoOrgConnectorResponse,
  GetTriggerInvalidYamlResponse,
  GetTriggerEmptyActionsResponse,
  GetTriggerWithPushEventResponse,
  GetTriggerWithMergeRequestEventResponse,
  updateTriggerMockResponseYaml,
  enabledFalseUpdateTriggerMockResponseYaml,
  GenerateWebhookTokenResponse
} from './webhookMockResponses'
import {
  GetPipelineResponse,
  GetTemplateFromPipelineResponse,
  GetMergeInputSetFromPipelineTemplateWithListInputResponse,
  ConnectorResponse,
  RepoConnectorResponse,
  GetInputSetsResponse
} from './sharedMockResponses'
import TriggersWizardPage from '../TriggersWizardPage'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const mockUpdate = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => <TestWrapper>{children}</TestWrapper>
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <TriggersWizardPage />
    </TestWrapper>
  )
}

describe('TriggersWizardPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('OnEdit Render - GitHub Show all fields filled', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetTrigger').mockReturnValue(GetTriggerResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())
      await waitFor(() =>
        expect(() =>
          queryByText(document.body, result.current.getString('pipeline-triggers.listenOnNewWebhook'))
        ).not.toBeNull()
      )
      expect(container).toMatchSnapshot()
    })

    test('OnEdit Render - GitHub with repo org level connector', async () => {
      // anyAction checked due to empty actions,
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepoConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTrigger')
        .mockReturnValue(GetTriggerRepoOrgConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())
      await waitFor(() =>
        expect(() =>
          queryByText(document.body, result.current.getString('pipelineSteps.build.create.repositoryNameLabel'))
        ).not.toBeNull()
      )
      expect(container).toMatchSnapshot()
    })

    test('Invalid yaml shows error message', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTrigger')
        .mockReturnValue(GetTriggerInvalidYamlResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      render(<WrapperComponent />)
      await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())
      await waitFor(() =>
        expect(() =>
          queryByText(document.body, result.current.getString('pipeline-triggers.cannotParseTriggersData'))
        ).not.toBeNull()
      )
    })
  })

  describe('Payload/Values Comparison', () => {
    afterEach(() => {
      jest.clearAllMocks()
      const { clear } = useToaster()
      clear()
    })
    test('Submit shows all onEdit values were parsed into FormikValues for re-submission', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetTrigger').mockReturnValue(GetTriggerResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() =>
        queryByText(container, result.current.getString('pipeline-triggers.triggerConfigurationLabel'))
      )

      const tab3 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Pipeline Input"]')
      if (!tab3) {
        throw Error('No Pipeline Input tab')
      }
      fireEvent.click(tab3)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.updateTrigger')).not.toBeNull())
      const updateButton = queryByText(container, result.current.getString('pipeline-triggers.updateTrigger'))
      if (!updateButton) {
        throw Error('Cannot find Update Trigger button')
      }

      fireEvent.click(updateButton)
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
      expect(mockUpdate).toBeCalledWith(updateTriggerMockResponseYaml)
    })

    test('Submit onEdit values with Enabled False', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetTrigger').mockReturnValue(GetTriggerResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() =>
        queryByText(container, result.current.getString('pipeline-triggers.triggerConfigurationLabel'))
      )

      const enabledSwitch = container.querySelector('[data-name="enabled-switch"]')
      if (!enabledSwitch) {
        throw Error('cannot find enabled switch')
      } else {
        fireEvent.click(enabledSwitch)
      }

      const tab3 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Pipeline Input"]')
      if (!tab3) {
        throw Error('No Pipeline Input tab')
      }
      fireEvent.click(tab3)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.updateTrigger')).not.toBeNull())
      const updateButton = queryByText(container, result.current.getString('pipeline-triggers.updateTrigger'))
      if (!updateButton) {
        throw Error('Cannot find Update Trigger button')
      }

      fireEvent.click(updateButton)
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
      expect(mockUpdate).toBeCalledWith(enabledFalseUpdateTriggerMockResponseYaml)
    })

    test('Submit onEdit shows toast to fill out actions', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTrigger')
        .mockReturnValue(GetTriggerWithMergeRequestEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      // simulating if PUSH event had results, then does not submit because it is required
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(document.body.querySelector('[data-name="enabled-switch"]')).not.toBeNull())

      const enabledSwitch = document.body.querySelector('[data-name="enabled-switch"]')
      if (!enabledSwitch) {
        throw Error('cannot find enabled switch')
      } else {
        fireEvent.click(enabledSwitch)
      }

      const tab3 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Pipeline Input"]')
      if (!tab3) {
        throw Error('No Pipeline Input tab')
      }
      fireEvent.click(tab3)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.updateTrigger')).not.toBeNull())
      const updateButton = queryByText(container, result.current.getString('pipeline-triggers.updateTrigger'))
      if (!updateButton) {
        throw Error('Cannot find Update Trigger button')
      }

      fireEvent.click(updateButton)
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(0))
      await waitFor(() => expect(result.current.getString('addressErrorFields')).not.toBeNull())
    })

    test('Submit onEdit does not require push because empty actions response', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTrigger')
        .mockReturnValue(GetTriggerWithPushEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListPushEventResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(document.body.querySelector('[data-name="enabled-switch"]')).not.toBeNull())

      const enabledSwitch = document.body.querySelector('[data-name="enabled-switch"]')
      if (!enabledSwitch) {
        throw Error('cannot find enabled switch')
      } else {
        fireEvent.click(enabledSwitch)
      }

      const tab3 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Pipeline Input"]')
      if (!tab3) {
        throw Error('No Pipeline Input tab')
      }
      fireEvent.click(tab3)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.updateTrigger')).not.toBeNull())
      const updateButton = queryByText(container, result.current.getString('pipeline-triggers.updateTrigger'))
      if (!updateButton) {
        throw Error('Cannot find Update Trigger button')
      }

      fireEvent.click(updateButton)
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    })
  })

  describe('Missed Tests', () => {
    test('OnEdit Render - Show all fields filled with any actions checked', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetSourceRepoToEvent')
        .mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
        .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
        .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetTrigger')
        .mockReturnValue(GetTriggerEmptyActionsResponse as UseGetReturn<any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGenerateWebhookToken')
        .mockReturnValue((GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
        mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
        mutate: mockUpdate as unknown
      } as UseMutateReturn<any, any, any, any, any>)
      jest
        .spyOn(pipelineNg, 'useGetActionsList')
        .mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())
      await waitFor(() =>
        expect(() =>
          queryByText(document.body, result.current.getString('pipeline-triggers.listenOnNewWebhook'))
        ).not.toBeNull()
      )
      expect(container).toMatchSnapshot()
    })
  })
})

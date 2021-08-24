import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { useStrings } from 'framework/strings'
import * as pipelineNg from 'services/pipeline-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import * as cdng from 'services/cd-ng'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import {
  GetGitTriggerEventDetailsResponse,
  PostCreateVariables,
  GetSchemaYaml,
  GetManifestTriggerResponse,
  updateManifestTriggerMockResponseYaml
} from './webhookMockResponses'

import {
  GetPipelineResponse,
  GetTemplateFromPipelineResponse,
  GetMergeInputSetFromPipelineTemplateWithListInputResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetManifestPipelineResponse,
  GetManifestTemplateFromPipelineResponse,
  GetManifestInputSetsResponse
} from './sharedMockResponses'
import TriggersWizardPage from '../TriggersWizardPage'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
))

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline',
  triggerIdentifier: 'triggerIdentifier',
  module: 'cd'
}

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
  return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
})
jest.spyOn(cdng, 'useListGitSync').mockImplementation((): any => {
  return { data: gitConfigs, refetch: getListGitSync, loading: false }
})
jest.spyOn(cdng, 'useGetSourceCodeManagers').mockImplementation((): any => {
  return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
})

const mockUpdate = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

jest.mock('@pipeline/factories/ArtifactTriggerInputFactory', () => ({
  getTriggerFormDetails: jest.fn().mockImplementation(() => () => {
    return {
      component: <div>ABC</div>
    }
  })
}))

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
      <TriggersWizardPage />
    </TestWrapper>
  )
}
const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Manifest Trigger Tests', () => {
  test('throws validation error when select artifact/manifest is not added', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)

    jest.spyOn(pipelineNg, 'useGetSchemaYaml').mockImplementation(() => {
      return {
        data: GetSchemaYaml as any,
        refetch: jest.fn(),
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    })

    jest
      .spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      .mockReturnValue(GetManifestTriggerResponse as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
      .mockReturnValue(GetInputSetsResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetPipeline').mockReturnValue(GetPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
      .mockReturnValue(GetTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTrigger')
      .mockReturnValue(GetManifestTriggerResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
      mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
      mutate: mockUpdate as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    const { container } = render(<WrapperComponent />)
    await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())
    await waitFor(() =>
      expect(() =>
        queryByText(
          document.body,
          result.current.getString('pipeline.triggers.artifactTriggerConfigPanel.listenOnNewArtifact')
        )
      ).not.toBeNull()
    )
    const tab3 = container.querySelector('[data-tab-id="Pipeline Input"]')

    if (!tab3) {
      throw Error('No Pipeline Input tab')
    }

    expect(container).toMatchSnapshot()
    await waitFor(() =>
      expect(() =>
        queryByText(
          document.body,
          result.current.getString('pipeline.triggers.artifactTriggerConfigPanel.noSelectableArtifactsFound')
        )
      ).toBeDefined()
    )
  })

  test('Check chartVersion to be disabled and default value is <+trigger.manifest.version>', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetSchemaYaml').mockImplementation(() => {
      return {
        data: GetSchemaYaml as any,
        refetch: jest.fn(),
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    })

    jest
      .spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      .mockReturnValue(GetGitTriggerEventDetailsResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useCreateVariables').mockImplementation(() => ({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: jest.fn().mockImplementation(() => PostCreateVariables)
    }))
    jest
      .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
      .mockReturnValue(GetManifestInputSetsResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetPipeline')
      .mockReturnValue(GetManifestPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
      .mockReturnValue(GetManifestTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTrigger')
      .mockReturnValue(GetManifestTriggerResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
      mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
      mutate: mockUpdate as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    const { container } = render(<WrapperComponent />)
    await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())

    const tab3 = container.querySelector('[data-tab-id="Pipeline Input"]')

    if (!tab3) {
      throw Error('No Pipeline Input tab')
    }
    fireEvent.click(tab3)
    await waitFor(() => expect(result.current.getString('pipeline.triggers.updateTrigger')).not.toBeNull())
    const updateButton = queryByText(container, result.current.getString('pipeline.triggers.updateTrigger'))
    if (!updateButton) {
      throw Error('Cannot find Update Trigger button')
    }

    const chartVersionElem = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.manifests[1].manifest.spec.chartVersion',
      container
    ) as HTMLInputElement
    expect(chartVersionElem.value).toBe('<+trigger.manifest.version>')
    expect(chartVersionElem).toBeDisabled()
    expect(container).toMatchSnapshot()
  })

  test('submit on edit with right payload', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(ConnectorResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetSchemaYaml').mockImplementation(() => {
      return {
        data: GetSchemaYaml as any,
        refetch: jest.fn(),
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    })

    jest
      .spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      .mockReturnValue(GetGitTriggerEventDetailsResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useCreateVariables').mockImplementation(() => ({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: jest.fn().mockImplementation(() => PostCreateVariables)
    }))
    jest
      .spyOn(pipelineNg, 'useGetInputSetsListForPipeline')
      .mockReturnValue(GetManifestInputSetsResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetPipeline')
      .mockReturnValue(GetManifestPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTemplateFromPipeline')
      .mockReturnValue(GetManifestTemplateFromPipelineResponse as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(pipelineNg, 'useGetTrigger')
      .mockReturnValue(GetManifestTriggerResponse as UseGetReturn<any, any, any, any>)
    jest.spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockReturnValue({
      mutate: jest.fn().mockReturnValue(GetMergeInputSetFromPipelineTemplateWithListInputResponse) as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    jest.spyOn(pipelineNg, 'useUpdateTrigger').mockReturnValue({
      mutate: mockUpdate as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    const { container } = render(<WrapperComponent />)
    await waitFor(() => expect(() => queryByText(document.body, 'Loading, please wait...')).toBeDefined())

    const tab3 = container.querySelector('[data-tab-id="Pipeline Input"]')

    if (!tab3) {
      throw Error('No Pipeline Input tab')
    }
    fireEvent.click(tab3)

    await waitFor(() => expect(result.current.getString('pipeline.triggers.updateTrigger')).not.toBeNull())
    const updateButton = queryByText(container, result.current.getString('pipeline.triggers.updateTrigger'))
    if (!updateButton) {
      throw Error('Cannot find Update Trigger button')
    }

    fireEvent.click(updateButton)
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))

    expect(mockUpdate).toBeCalledWith(updateManifestTriggerMockResponseYaml)
  })
})

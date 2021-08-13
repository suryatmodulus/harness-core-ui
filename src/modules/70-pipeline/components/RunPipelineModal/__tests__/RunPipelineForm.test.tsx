import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import {
  useGetTemplateFromPipeline,
  useGetPreflightCheckResponse,
  startPreflightCheckPromise
} from 'services/pipeline-ng'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { RunPipelineForm } from '../RunPipelineForm'

import {
  mockCreateInputSetResponse,
  mockGetPipeline,
  mockInputSetsList,
  mockMergeInputSetResponse,
  mockPipelineTemplateYaml,
  mockPipelineTemplateYamlForRerun,
  mockPipelineVariablesResponse,
  mockPostPipelineExecuteYaml,
  mockPreflightCheckResponse,
  mockRePostPipelineExecuteYaml
} from './mocks'

const commonProps: PipelineType<PipelinePathProps & GitQueryParams> = {
  pipelineIdentifier: 'pid',
  projectIdentifier: 'prjid',
  accountId: 'acid',
  orgIdentifier: 'orgId',
  branch: 'br',
  repoIdentifier: 'repoid',
  module: 'ci'
}

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/cd-ng', () => ({
  useGetSourceCodeManagers: () => ({
    data: []
  }),
  useCreatePR: () => ({
    data: [],
    mutate: jest.fn()
  }),
  useGetFileContent: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useListGitSync: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  })
}))
jest.mock('services/pipeline-ng', () => ({
  useCreateInputSetForPipeline: () => mockCreateInputSetResponse,
  useGetTemplateFromPipeline: jest.fn(),
  useGetPipeline: () => mockGetPipeline,
  usePostPipelineExecuteWithInputSetYaml: () => mockPostPipelineExecuteYaml,
  useRePostPipelineExecuteWithInputSetYaml: () => mockRePostPipelineExecuteYaml,
  useGetInputSetsListForPipeline: () => mockInputSetsList,
  useGetMergeInputSetFromPipelineTemplateWithListInput: () => mockMergeInputSetResponse,
  useCreateVariables: () => mockPipelineVariablesResponse,
  useGetPreflightCheckResponse: jest.fn(),
  startPreflightCheckPromise: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn(),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: { data: {} }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('STUDIO MODE', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '' }))
    // eslint-disable-next-line
    // @ts-ignore
    useGetTemplateFromPipeline.mockImplementation(() => mockPipelineTemplateYaml)
  })

  test('should toggle visual and yaml mode', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    fireEvent.click(getByText('yaml'))
    const editorDiv = container.querySelector('.editor')
    await waitFor(() => expect(editorDiv).toBeTruthy())

    fireEvent.click(getByText('visual'))
    await waitFor(() =>
      expect(queryByText('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')).toBeTruthy()
    )
  })

  test('should display the help text on hover', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    fireEvent.mouseOver(getByText('pipeline.triggers.pipelineInputPanel.whatAreInputsets'))
    await waitFor(() => expect(queryByText('pipeline.inputSets.aboutInputSets')).toBeTruthy())
  })

  test('should not allow submit if form is incomplete', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Submit the incomplete form
    const runButton = container.querySelector('button[type="submit"]')
    act(() => {
      fireEvent.click(runButton!)
    })

    // Verify the ErrorStrip is present and submit is disabled
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())
    await waitFor(() => expect(queryByText('common.seeDetails')).toBeTruthy())
    const buttonShouldBeDisabled = container.querySelector('.bp3-disabled')
    expect(buttonShouldBeDisabled).toBeTruthy()
  })

  test('should submit and call the run pipeine method if form is valid', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Enter a value for the pipeline variable
    const variableInputElement = container.querySelector('input[name="variables[0].value"]')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    // Skip the preflight check
    act(() => {
      fireEvent.click(getByText('pre-flight-check.skipCheckBtn'))
    })

    const runButton = container.querySelector('button[type="submit"]')

    // Form is valid try andsubmit the pipeline
    act(() => {
      fireEvent.click(runButton!)
    })

    await waitFor(() => expect(mockPostPipelineExecuteYaml.mutate).toBeCalled())
  })

  test('if SAVE_AS_INPUT_SET works', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    fireEvent.click(getByText('pipeline.triggers.pipelineInputPanel.provide'))
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Enter a value for the pipeline variable
    const variableInputElement = container.querySelector('input[name="variables[0].value"]')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    act(() => {
      fireEvent.click(getByText('inputSets.saveAsInputSet'))
    })

    // Check on input set form
    await waitFor(() => expect(queryByText('inputSets.inputSetName')).toBeTruthy())

    // Enter input set name
    const inputSetNameDiv = document.body.querySelector('input[name="name"]')
    fireEvent.change(inputSetNameDiv!, { target: { value: 'inputsetname' } })

    // Hit save
    act(() => {
      fireEvent.click(getByText('save'))
    })

    // Expect the input set save API to be called
    await waitFor(() => expect(mockCreateInputSetResponse.mutate).toBeCalled())
  })

  test('should close the modal on cancel click', async () => {
    const onCloseMocked = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} onClose={onCloseMocked} />
      </TestWrapper>
    )

    fireEvent.click(getByText('cancel'))

    await waitFor(() => expect(onCloseMocked).toBeCalled())
  })

  test('should accept values from input sets and submit the form', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(queryByText('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')).toBeTruthy()
    )

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is1')).toBeTruthy())

    // Select the input sets - is1 and then is2
    act(() => {
      fireEvent.click(getByText('is1'))
    })
    act(() => {
      fireEvent.click(getByText('is2'))
    })

    // Apply the input sets
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Expect the merge APi to be called
    await waitFor(() => expect(mockMergeInputSetResponse.mutate).toBeCalled())

    // Save the snapshot - value is present from merge input set API
    expect(container).toMatchSnapshot('after applying input sets')
  })
})

describe('RERUN MODE', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '/testExecutionId' }))
    // eslint-disable-next-line
    // @ts-ignore
    useGetTemplateFromPipeline.mockImplementation(() => mockPipelineTemplateYamlForRerun)
    // eslint-disable-next-line
    // @ts-ignore
    useGetPreflightCheckResponse.mockImplementation(() => mockPreflightCheckResponse)
    // eslint-disable-next-line
    // @ts-ignore
    startPreflightCheckPromise.mockResolvedValue({})
  })

  test('should should have the values prefilled', async () => {
    const { container, queryByText, queryByDisplayValue } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} inputSetYAML={mockPipelineTemplateYamlForRerun.data?.data?.inputSetYaml} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Check the prefilled value of the variable
    expect(queryByDisplayValue('variablevalue')).toBeTruthy()

    // Submit should call the preflight check API
    const runButton = container.querySelector('button[type="submit"]')
    act(() => {
      fireEvent.click(runButton!)
    })

    // Mocked preflight response is 'SUCCESS', so it will contine to execution and call the rerun API
    // Check if rerun API is called
    await waitFor(() => expect(mockRePostPipelineExecuteYaml.mutate).toBeCalled())
  })
})

describe('EXECUTION VIEW', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ executionId: '/testExecutionId' }))
    // eslint-disable-next-line
    // @ts-ignore
    useGetTemplateFromPipeline.mockImplementation(() => mockPipelineTemplateYamlForRerun)
  })
  test('should should have the values prefilled and fields as disabled', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm
          {...commonProps}
          inputSetYAML={mockPipelineTemplateYamlForRerun.data?.data?.inputSetYaml}
          executionView={true}
          executionInputSetTemplateYaml={mockPipelineTemplateYamlForRerun.data?.data?.inputSetTemplateYaml}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    expect(container).toMatchSnapshot('disabled view in execution inputs')
  })
})

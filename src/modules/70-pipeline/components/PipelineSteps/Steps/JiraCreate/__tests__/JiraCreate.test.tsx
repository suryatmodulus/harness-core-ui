/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { JiraCreate } from '../JiraCreate'
import {
  getJiraCreateDeploymentModeProps,
  getJiraCreateEditModeProps,
  getJiraCreateEditModePropsWithValues,
  getJiraCreateInputVariableModeProps,
  mockConnectorResponse,
  mockProjectMetadataResponse,
  mockProjectsResponse
} from './JiraCreateTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJiraProjects: () => mockProjectsResponse,
  useGetJiraIssueCreateMetadata: () => mockProjectMetadataResponse
}))

describe('Jira Create tests', () => {
  beforeEach(() => {
    factory.registerStep(new JiraCreate())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getJiraCreateDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getJiraCreateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('jira-create-deploymentform')
  })

  test('Deploymentform readonly mode', async () => {
    const props = getJiraCreateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('jira-create-deploymentform-readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getJiraCreateDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        template={{ spec: {} }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('jira-create-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getJiraCreateInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        template={{ spec: {} }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-create-input variable view')
  })

  test('Edit Stage - readonly view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraCreateEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )
    expect(container).toMatchSnapshot('edit-stage-readonly')
  })

  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraCreateEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    act(() => ref.current?.submitForm())
    await waitFor(() => expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy())

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira create step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    act(() => ref.current?.submitForm())
    await waitFor(() => expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy())
    await waitFor(() => {
      expect(queryByText('pipeline.jiraApprovalStep.validations.project')).toBeTruthy()
      expect(queryByText('pipeline.jiraApprovalStep.validations.issueType')).toBeTruthy()
    })
    await waitFor(() => expect(queryByText('pipeline.jiraCreateStep.validations.summary')).toBeTruthy())
  })

  test('Open a saved step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = { ...getJiraCreateEditModePropsWithValues() }
    const {
      container,
      getByText,
      getByTestId,
      queryByPlaceholderText,
      getByPlaceholderText,
      queryByDisplayValue,
      queryByText
    } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraCreate}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira createe step' } })
    expect(queryByDisplayValue('1d')).toBeTruthy()
    expect(queryByDisplayValue('pid1')).toBeTruthy()
    expect(queryByDisplayValue('itd1')).toBeTruthy()
    expect(queryByDisplayValue('summaryval')).toBeTruthy()

    fireEvent.click(getByText('common.optionalConfig'))

    // Check if summary abd other fields are populated
    expect(queryByDisplayValue('value1')).toBeTruthy()
    expect(queryByDisplayValue('2233')).toBeTruthy()
    expect(queryByDisplayValue('23-march')).toBeTruthy()

    fireEvent.change(getByPlaceholderText('pipeline.jiraCreateStep.summaryPlaceholder'), {
      target: { value: 'summary' }
    })

    // Open the fields selector dialog
    act(() => {
      fireEvent.click(getByText('pipeline.jiraCreateStep.fieldSelectorAdd'))
    })

    await waitFor(() => expect(queryByText('pipeline.jiraCreateStep.selectFieldListHelp')).toBeTruthy())
    const dialogContainer = document.body.querySelector('.bp3-portal')
    const icon = dialogContainer?.querySelectorAll('[icon="chevron-down"]')

    // select project
    fireEvent.click(icon![0])
    fireEvent.click(getByText('p1'))

    // select issue type
    fireEvent.click(icon![1])
    fireEvent.click(getByText('it1'))

    // Click the new custom field
    fireEvent.click(getByText('f1'))

    // Add the field to jira create form
    const button = dialogContainer?.querySelector('.bp3-button-text')
    fireEvent.click(button!)

    // The selected field should be now added to the main form
    expect(queryByPlaceholderText('f1')).toBeTruthy()

    // Open the fields selector dialog again
    act(() => {
      fireEvent.click(getByText('pipeline.jiraCreateStep.fieldSelectorAdd'))
    })
    // Click on provide field list option - to add KV pairs
    fireEvent.click(getByText('pipeline.jiraCreateStep.provideFieldList'))

    const dialogContainerPostUpdate = document.body.querySelector('.bp3-portal')
    act(() => {
      fireEvent.click(getByTestId('add-fieldList'))
    })
    // add the new KV pair inside the dialog container
    const keyDiv = dialogContainerPostUpdate?.querySelector('input[name="fieldList[0].name"]')
    fireEvent.change(keyDiv!, { target: { value: 'issueKey1' } })
    const valueDiv = dialogContainerPostUpdate?.querySelector('input[name="fieldList[0].value"]')
    fireEvent.change(valueDiv!, { target: { value: 'issueKey1Value' } })

    // Add the field to form
    const addButton = dialogContainerPostUpdate?.querySelector('button[type="submit"]')
    fireEvent.click(addButton!)

    // the new kv pair should now be visible in the main form
    expect(queryByDisplayValue('issueKey1')).toBeTruthy()
    expect(queryByDisplayValue('issueKey1Value')).toBeTruthy()
    await act(() => ref.current?.submitForm())
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'jira_createe_step',
      timeout: '1d',
      type: 'JiraCreate',
      spec: {
        connectorRef: 'cid1',
        projectKey: 'pid1',
        issueType: 'itd1',
        fields: [
          { name: 'Summary', value: 'summary' },
          { name: 'Description', value: 'descriptionval' },
          { name: 'f1', value: '' },
          { name: 'f21', value: 'value1' },
          { name: 'f2', value: 2233 },
          { name: 'date', value: '23-march' },
          { name: 'issueKey1', value: 'issueKey1Value' }
        ]
      },
      name: 'jira createe step'
    })
  })
})

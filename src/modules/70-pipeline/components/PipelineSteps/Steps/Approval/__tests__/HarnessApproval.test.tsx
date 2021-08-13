import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { HarnessApproval } from '../HarnessApproval'
import {
  getHarnessApprovalDeploymentModeProps,
  getHarnessApprovalInputVariableModeProps,
  mockUserGroupsResponse,
  getHarnessApprovalEditModeProps,
  getHarnessApprovalEditModePropsWithValues
} from './HarnessApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetUserGroupList: () => mockUserGroupsResponse
}))

describe('Harness Approval tests', () => {
  beforeEach(() => {
    factory.registerStep(new HarnessApproval())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-deploymentform')
  })

  test('Basic snapshot - deploymentform mode readonly', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-deploymentform-readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        template={{ spec: { approvers: {} } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('harness-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getHarnessApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        template={{ spec: { approvers: {} } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-input variable view')
  })

  test('Basic functions - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm())
    expect(getByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'harness approval step' } })
    fireEvent.change(queryByNameAttribute('spec.approvalMessage')!, { target: { value: 'approval message' } })
    fireEvent.click(queryByNameAttribute('spec.includePipelineExecutionHistory')!)

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm())
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    await act(() => ref.current?.submitForm())

    await waitFor(() => expect(queryByText('pipeline.approvalStep.validation.userGroups')).toBeTruthy())
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage readonly')
  })

  test('On submit call', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { container, queryByDisplayValue, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    expect(container).toMatchSnapshot('values populating on edit')

    // Open third accordion
    act(() => {
      fireEvent.click(getByText('common.optionalConfig'))
    })
    expect(queryByDisplayValue('somekey')).toBeTruthy()
    expect(queryByDisplayValue('somevalue')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.addApproverInputs'))
    })

    await act(() => ref.current?.submitForm())
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'hhaass',
      timeout: '10m',
      type: 'HarnessApproval',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        includePipelineExecutionHistory: true,
        approverInputs: [{ name: 'somekey', defaultValue: 'somevalue' }],
        approvers: {
          userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6'],
          minimumCount: 1,
          disallowPipelineExecutor: true
        }
      },
      name: 'harness approval step'
    })
  })
})

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

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

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

    fireEvent.click(getByText('pipeline.approvalStep.approvers'))
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
    const { queryByDisplayValue, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    expect(queryByDisplayValue('10m')).toBeTruthy()
    expect(queryByDisplayValue('harness approval step')).toBeTruthy()

    // Open first accordion
    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.message'))
    })
    expect(queryByDisplayValue('Approving pipeline <+pname>')).toBeTruthy()

    // Open second accordion
    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.approvers'))
    })
    expect(queryByDisplayValue('1')).toBeTruthy()
    expect(queryByText('ug1')).toBeTruthy()
    expect(queryByText('ug2')).toBeTruthy()

    // Open third accordion
    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.approverInputs'))
    })
    expect(queryByDisplayValue('somekey')).toBeTruthy()
    expect(queryByDisplayValue('somevalue')).toBeTruthy()

    await act(() => ref.current?.submitForm())
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'hhaass',
      timeout: '10m',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        includePipelineExecutionHistory: true,
        approverInputs: [{ name: 'somekey', defaultValue: 'somevalue' }],
        approvers: {
          userGroups: ['ug1', 'ug2'],
          minimumCount: 1,
          disallowPipelineExecutor: true
        }
      },
      name: 'harness approval step'
    })
  })
})

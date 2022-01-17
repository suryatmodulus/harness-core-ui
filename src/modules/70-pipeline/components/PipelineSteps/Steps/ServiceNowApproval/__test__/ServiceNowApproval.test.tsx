/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { ServiceNowApproval } from '../ServiceNowApproval'
import { getDefaultCriterias } from '../helper'
import {
  getServiceNowApprovalInputVariableModeProps,
  mockConnectorResponse,
  mockTicketTypesResponse,
  mockServiceNowCreateMetadataResponse,
  getServiceNowApprovalEditModeProps,
  getServiceNowApprovalEditModePropsWithValues,
  getServiceNowApprovalDeploymentModeProps
} from './ServiceNowApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetServiceNowTicketTypes: () => mockTicketTypesResponse,
  useGetServiceNowIssueCreateMetadata: () => mockServiceNowCreateMetadataResponse
}))

describe('ServiceNow Approval tests', () => {
  beforeEach(() => {
    factory.registerStep(new ServiceNowApproval())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getServiceNowApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('deploymentform mode - readonly', async () => {
    const props = getServiceNowApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-approval-deploymentform readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getServiceNowApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('serviceNow-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getServiceNowApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-approval-input variable view')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowApprovalEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm())
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'serviceNow approval step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm())
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    await act(() => ref.current?.submitForm())

    await waitFor(() => {
      expect(queryByText('pipeline.serviceNowApprovalStep.validations.ticketType')).toBeTruthy()
      expect(queryByText('pipeline.approvalCriteria.validations.approvalCriteriaCondition')).toBeTruthy()
    })

    fireEvent.click(getByText('add'))
    await waitFor(() =>
      expect(queryByText('pipeline.approvalCriteria.validations.approvalCriteriaCondition')).toBeNull()
    )

    fireEvent.click(getByText('common.jexlExpression'))
    await waitFor(() => expect(queryByText('pipeline.approvalCriteria.validations.expression')).toBeTruthy())
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowApprovalEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage view readonly')
  })

  test('Open a saved serviceNow approval step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowApprovalEditModePropsWithValues()
    const { container, getByText, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'serviceNow approval step' } })
    expect(queryByDisplayValue('10m')).toBeTruthy()
    expect(queryByDisplayValue('p1')).toBeTruthy()
    expect(queryByDisplayValue('itd1')).toBeTruthy()

    expect(queryByDisplayValue('somevalue for f1')).toBeTruthy()

    fireEvent.click(getByText('common.optionalConfig'))
    expect(queryByDisplayValue("<+state> == 'Blocked'")).toBeTruthy()

    await act(() => ref.current?.submitForm())
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'serviceNow_approval_step',
      timeout: '10m',
      type: 'ServiceNowApproval',
      spec: {
        connectorRef: 'cid1',
        ticketNumber: 'itd1',
        ticketType: 'pid1',
        approvalCriteria: {
          type: 'KeyValues',
          spec: {
            matchAnyCondition: true,
            conditions: [
              {
                key: 'state',
                operator: 'in',
                value: 'Done,todo'
              },
              {
                key: 'f1',
                operator: 'equals',
                value: 'somevalue for f1'
              }
            ]
          }
        },
        rejectionCriteria: {
          type: 'Jexl',
          spec: {
            expression: "<+state> == 'Blocked'"
          }
        }
      },
      name: 'serviceNow approval step'
    })
  })
})

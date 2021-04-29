import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import ConnectionDetailsStep from '../ConnectionDetailsStep'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const mockPrevStateData: ConnectorInfoDTO = {
  name: 'mockname',
  identifier: 'mockname',
  description: '',
  tags: {},
  type: 'CEAws',
  spec: {
    billingPermission: false,
    eventsPermission: false,
    optimizationPermission: true,
    roleARN: '',
    externalID: 'mockexID'
  }
}

jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('services/lw', () => ({
  useGetCloudFormationTemplate: jest.fn().mockImplementation(() => ({
    data: {
      response: {
        path: 'mock.yaml'
      }
    },
    error: null
  }))
}))

const mockexID = 'mockexID'
const mockARN = 'mockARN'

describe('Test Step 2', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <ConnectionDetailsStep name={'AWS Connection Details'} prevStepData={mockPrevStateData} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render after button is clicked', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <ConnectionDetailsStep name={'AWS Connection Details'} prevStepData={mockPrevStateData} />
      </TestWrapper>
    )

    const followbutton = await findByText(container, 'ce.connector.AWS.crossAccountRole.instructionLabel')
    expect(followbutton).toBeDefined()

    act(() => {
      fireEvent.click(followbutton)
    })

    let externalIdInput
    await waitFor(() => {
      externalIdInput = screen.getAllByText('ce.connector.AWS.crossAccountRole.arn')
    })
    expect(externalIdInput).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('check Launch Template', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <ConnectionDetailsStep name={'AWS Connection Details'} prevStepData={mockPrevStateData} />
      </TestWrapper>
    )
    window.open = jest.fn()
    const followbutton = await findByText(container, 'ce.connector.AWS.crossAccountRole.instructionLabel')
    expect(followbutton).toBeDefined()

    act(() => {
      fireEvent.click(followbutton)
    })

    let externalIdInput
    await waitFor(() => {
      externalIdInput = screen.getByText('ce.connector.AWS.crossAccountRole.arn')
    })
    expect(externalIdInput).toBeDefined()

    const launchTemplateButton = screen.getByText('ce.connector.AWS.crossAccountRole.templateLaunchText')
    fireEvent.click(launchTemplateButton)
  })

  test('check Launch Template', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <ConnectionDetailsStep name={'AWS Connection Details'} prevStepData={mockPrevStateData} />
      </TestWrapper>
    )
    window.open = jest.fn()
    const followbutton = await findByText(container, 'ce.connector.AWS.crossAccountRole.instructionLabel')
    expect(followbutton).toBeDefined()

    act(() => {
      fireEvent.click(followbutton)
    })

    let externalIdInput
    await waitFor(() => {
      externalIdInput = screen.getByText('ce.connector.AWS.crossAccountRole.arn')
    })
    expect(externalIdInput).toBeDefined()

    const launchTemplateButton = screen.getByText('ce.connector.AWS.crossAccountRole.templateLaunchText')
    fireEvent.click(launchTemplateButton)
  })

  test('Form submits succesfully', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <ConnectionDetailsStep name={'AWS Connection Details'} prevStepData={mockPrevStateData} />
      </TestWrapper>
    )
    window.open = jest.fn()
    const followbutton = await findByText(container, 'ce.connector.AWS.crossAccountRole.instructionLabel')
    expect(followbutton).toBeDefined()

    act(() => {
      fireEvent.click(followbutton)
    })

    await waitFor(() => {
      expect(container.querySelector('input[name="externalID"]')).toBeDefined()
    })
    const externalIdInput = container.querySelector('input[name="externalID"]') as HTMLInputElement
    const roleARNInput = container.querySelector('input[name="roleARN"]') as HTMLInputElement
    expect(externalIdInput).toBeDefined()
    expect(roleARNInput).toBeDefined()

    fireEvent.change(externalIdInput, { target: { value: mockexID } })
    fireEvent.change(roleARNInput, { target: { value: mockARN } })

    waitFor(() => {
      expect(externalIdInput.value).toBe(mockexID)
    })
    expect(roleARNInput.value).toBe(mockARN)

    const submit = screen.getByText('ce.connector.AWS.overview.submitText')
    fireEvent.click(submit)
  })
})

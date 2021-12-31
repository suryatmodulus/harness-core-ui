import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceNowApprovalTab } from '@pipeline/components/execution/StepDetails/tabs/ServiceNowApprovalTab/ServiceNowApprovalTab'
import approvalData from './ServiceNowAprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('<ServiceNowApprovalTab/> tests', () => {
  test('isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceNowApprovalTab isWaiting={true} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceNowApprovalTab isWaiting={false} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not isWaiting test - rejected', () => {
    const rejectedData = { ...approvalData } as any
    rejectedData.status = 'REJECTED'
    const { container } = render(
      <TestWrapper>
        <ServiceNowApprovalTab isWaiting={false} approvalData={rejectedData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

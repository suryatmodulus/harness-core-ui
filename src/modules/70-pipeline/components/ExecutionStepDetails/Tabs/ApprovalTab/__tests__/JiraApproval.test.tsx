import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { JiraApproval } from '../JiraApproval/JiraApproval'
import approvalData from './JiraAprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => null)

describe('<JiraApproval/> tests', () => {
  test('isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <JiraApproval isWaiting={true} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <JiraApproval isWaiting={false} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

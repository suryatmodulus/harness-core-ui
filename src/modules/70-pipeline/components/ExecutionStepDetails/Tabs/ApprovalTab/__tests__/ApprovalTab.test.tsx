import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { ApprovalTab } from '../ApprovalTab'

import harnessApprovalData from './HarnessApprovalData.json'
import jiraData from './JiraAprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.format = () => 'XX:YY'
  return original
})

describe('<ApprovalTab /> tests', () => {
  const dateToString = jest.spyOn(Date.prototype, 'toLocaleString')

  beforeAll(() => {
    dateToString.mockImplementation(() => 'DUMMY DATE')
  })

  afterAll(() => {
    dateToString.mockRestore()
  })
  test('renders harness approval step', () => {
    const { container } = render(
      <TestWrapper>
        <ApprovalTab
          step={{ stepType: StepType.HarnessApproval }}
          mock={{ data: { data: harnessApprovalData } as any, loading: false }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders jira step', () => {
    const { container } = render(
      <TestWrapper>
        <ApprovalTab
          step={{ stepType: StepType.JiraApproval }}
          mock={{ data: { data: jiraData } as any, loading: false }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders loader while loading', () => {
    const { container } = render(
      <TestWrapper>
        <ApprovalTab
          step={{ stepType: StepType.JiraApproval }}
          mock={{ data: { data: jiraData } as any, loading: true }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

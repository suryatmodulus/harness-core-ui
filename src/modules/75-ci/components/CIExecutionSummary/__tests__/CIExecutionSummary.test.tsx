import React from 'react'
import { render } from '@testing-library/react'
import { CIExecutionSummary } from '../CIExecutionSummary'
import {
  successData,
  successNodeMapValue,
  failedToInitializeData,
  failedToInitializeNodeMapValue
} from './CIExecutionSummaryMockResponses'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (str: string) => str
  })
}))

describe('CIExecutionSummary tests', () => {
  test('Shows Successful summary', () => {
    const nodeMap = new Map()
    nodeMap.set('B_0CPXOkTDqp48_5HveraQ', successNodeMapValue)
    const { container } = render(<CIExecutionSummary data={successData} nodeMap={nodeMap} />)
    expect(container).toMatchSnapshot()
  })

  test('Shows Fails to Initialize Step - no commits', () => {
    const nodeMap = new Map()
    nodeMap.set('i29zaDnZS7S5vJJnxTnsaQ', failedToInitializeNodeMapValue)
    const { container } = render(<CIExecutionSummary data={failedToInitializeData} nodeMap={nodeMap} />)
    expect(container).toMatchSnapshot()
  })
})

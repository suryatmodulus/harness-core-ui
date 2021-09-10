import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import ExecutionMetadata from '../ExecutionMetadata'
import branchMock from './mocks/branch.json'
import tagMock from './mocks/tag.json'
import pullRequestMock from './mocks/pullRequest.json'

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: jest.fn()
}))

const TEST_EXECUTION_PATH = routes.toExecution({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

describe('<ExecutionMetadata.test /> tests', () => {
  const pathParams: PipelineType<ExecutionPathProps> = {
    accountId: 'TEST_ACCOUNT_ID',
    orgIdentifier: 'TEST_ORG',
    projectIdentifier: 'TEST_PROJECT',
    pipelineIdentifier: 'TEST_PIPELINE',
    executionIdentifier: 'TEST_EXECUTION',
    module: 'ci'
  }

  test('Branch type', () => {
    ;(useExecutionContext as jest.Mock).mockImplementation(() => ({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: branchMock
      }
    }))

    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionMetadata />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Tag type', () => {
    ;(useExecutionContext as jest.Mock).mockImplementation(() => ({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: tagMock
      }
    }))

    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionMetadata />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Pull Request type', () => {
    ;(useExecutionContext as jest.Mock).mockImplementation(() => ({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: pullRequestMock
      }
    }))

    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionMetadata />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

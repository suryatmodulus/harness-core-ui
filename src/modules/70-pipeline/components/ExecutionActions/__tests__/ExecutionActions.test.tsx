import React from 'react'
import { render, fireEvent, findByText, act } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useHandleInterrupt } from 'services/pipeline-ng'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'

import ExecutionActions from '../ExecutionActions'

jest.mock('services/pipeline-ng', () => ({
  useHandleInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useHandleStageInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => <div>YAMLBuilder</div>)

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  stageId: 'selectedStageId'
}

describe('<ExecutionActions /> tests', () => {
  test.each<[ExecutionStatus]>([
    ['Aborted'],
    ['Expired'],
    ['Failed'],
    ['NotStarted'],
    ['Paused'],
    ['Queued'],
    ['Running'],
    ['Success'],
    ['Suspended'],
    ['Waiting']
  ])('snapshot tests "%s" status', async executionStatus => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionActions params={pathParams as any} executionStatus={executionStatus} refetch={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('container')

    const btn = container.querySelector('[icon="more"]')?.closest('button')

    act(() => {
      fireEvent.click(btn!)
    })

    await findByText(document.body, 'Edit Pipeline')

    expect(document.body.querySelector('.bp3-menu')).toMatchSnapshot('Menu')
  })

  test.each<[ExecutionStatus, string, string]>([
    ['Paused', 'play', 'Resume'],
    ['Running', 'pause', 'Pause'],
    ['Running', 'stop', 'Abort']
  ])('Interrupt "%s" status  with action "%s"', async (executionStatus, icon, interruptType) => {
    const mutate = jest.fn()
    ;(useHandleInterrupt as jest.Mock).mockImplementation(() => ({
      mutate,
      loading: true,
      data: null
    }))

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionActions params={pathParams as any} executionStatus={executionStatus} refetch={jest.fn()} />
      </TestWrapper>
    )

    const btn = container.querySelector(`[icon="${icon}"]`)?.closest('button')

    act(() => {
      fireEvent.click(btn!)
    })

    expect(mutate).toHaveBeenCalledWith(
      {},
      {
        queryParams: {
          accountIdentifier: pathParams.accountId,
          orgIdentifier: pathParams.orgIdentifier,
          projectIdentifier: pathParams.projectIdentifier,
          interruptType
        }
      }
    )

    // await findByText(document.body, 'Edit Pipeline')
  })
})

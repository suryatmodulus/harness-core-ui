/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, act, RenderResult, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesLib from '@common/hooks/useFeatures'
import routes from '@common/RouteDefinitions'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { HandleInterruptQueryParams, useHandleInterrupt } from 'services/pipeline-ng'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'

import ExecutionActions from '../ExecutionActions'

jest.mock('services/pipeline-ng', () => ({
  useHandleInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useHandleStageInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null }))
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

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
    ['ResourceWaiting']
  ])('snapshot tests "%s" status', async executionStatus => {
    let result: RenderResult

    act(() => {
      result = render(
        <TestWrapper path={TEST_PATH} pathParams={pathParams}>
          <ExecutionActions params={pathParams as any} executionStatus={executionStatus} refetch={jest.fn()} />
        </TestWrapper>
      )
    })

    expect(result!.container).toMatchSnapshot('container')

    const btn = result!.container.querySelector('[icon="more"]')?.closest('button')

    act(() => {
      fireEvent.click(btn!)
    })

    await findByText(document.body, 'editPipeline')

    expect(document.body.querySelector('.bp3-menu')).toMatchSnapshot('Menu')
  })

  test.each<[ExecutionStatus, string, HandleInterruptQueryParams['interruptType']]>([
    ['Paused', 'play', 'Resume'],
    ['Running', 'pause', 'Pause'],
    ['Running', 'stop', 'AbortAll']
  ])('Interrupt "%s" status  with action "%s"', async (executionStatus, icon, interruptType) => {
    const mutate = jest.fn()
    ;(useHandleInterrupt as jest.Mock).mockImplementation(() => ({
      mutate,
      loading: true,
      data: null
    }))

    let result: RenderResult

    act(() => {
      result = render(
        <TestWrapper path={TEST_PATH} pathParams={pathParams}>
          <ExecutionActions params={pathParams as any} executionStatus={executionStatus} refetch={jest.fn()} />
        </TestWrapper>
      )
    })

    act(() => {
      const btn = result!.container.querySelector(`[data-icon="${icon}"]`)?.closest('button')
      fireEvent.click(btn!)
    })

    await waitFor(() => {
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
    })
  })

  test('if feature restriction is applied on rerun button', () => {
    jest.spyOn(useFeaturesLib, 'useGetFirstDisabledFeature').mockReturnValue({
      featureEnabled: false,
      disabledFeatureName: FeatureIdentifier.DEPLOYMENTS_PER_MONTH
    })

    const mutate = jest.fn()
    ;(useHandleInterrupt as jest.Mock).mockImplementation(() => ({
      mutate,
      loading: true,
      data: null
    }))

    let result: RenderResult

    act(() => {
      result = render(
        <TestWrapper path={TEST_PATH} pathParams={pathParams}>
          <ExecutionActions
            params={pathParams as any}
            executionStatus="Expired"
            refetch={jest.fn()}
            modules={['cd', 'ci']}
          />
        </TestWrapper>
      )
    })

    expect(result!.container).toMatchSnapshot('repeat button should be disabled as cd, ci are not allowed')
  })

  test('do not show the edit buttonif prop is false', () => {
    const mutate = jest.fn()
    ;(useHandleInterrupt as jest.Mock).mockImplementation(() => ({
      mutate,
      loading: true,
      data: null
    }))

    let result: RenderResult

    act(() => {
      result = render(
        <TestWrapper path={TEST_PATH} pathParams={pathParams}>
          <ExecutionActions
            params={pathParams as any}
            executionStatus="Expired"
            refetch={jest.fn()}
            showEditButton={false}
          />
        </TestWrapper>
      )
    })

    const moreIcon = result!.container.querySelector('span[icon="more"]')
    act(() => {
      fireEvent.click(moreIcon!)
    })
    const menuItems = result!.baseElement.querySelectorAll('.bp3-menu-item')
    const editPipelineMenuItem = Array.from(menuItems).find(item => item.textContent === 'editPipeline')
    expect(editPipelineMenuItem).toBeUndefined()
  })
})

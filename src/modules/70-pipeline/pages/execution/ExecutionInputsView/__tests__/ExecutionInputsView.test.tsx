/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import type { ExecutionPathParams } from '@pipeline/utils/executionUtils'

import mock from './mocks/schema.json'

import ExecutionInputsView from '../ExecutionInputsView'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/pipeline-ng', () => ({
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useGetTemplateFromPipeline: jest.fn(() => ({ data: null })),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetPipeline: jest.fn(() => ({ data: null })),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({ data: null })),
  useRePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({ data: null })),
  useRerunStagesWithRuntimeInputYaml: jest.fn(() => ({ data: null })),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => ({ data: null })),
  useGetInputSetsListForPipeline: jest.fn(() => ({ data: null, refetch: jest.fn() })),
  useGetYamlSchema: jest.fn(() => ({ data: null })),
  useCreateInputSetForPipeline: jest.fn(() => ({ data: null })),
  useGetInputsetYamlV2: jest.fn(() => ({ data: null })),
  useRunStagesWithRuntimeInputYaml: jest.fn(() => ({ data: null }))
}))

const TEST_PATH = routes.toExecutionInputsView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams: PipelineType<ExecutionPathParams> = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd'
}

describe('<ExecutionInputsView /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams as any}>
        <ExecutionInputsView mockData={mock as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

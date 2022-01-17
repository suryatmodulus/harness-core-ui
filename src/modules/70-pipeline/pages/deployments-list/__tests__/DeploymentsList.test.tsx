/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'

import data from '../../pipeline-deployment-list/__tests__/execution-list.json'
import pipelines from '../../../components/PipelineModalListView/__tests__/RunPipelineListViewMocks'
import filters from '../../pipeline-deployment-list/__tests__/filters.json'
import services from '../../pipelines/__tests__/mocks/services.json'
import environments from '../../pipelines/__tests__/mocks/environments.json'
import DeploymentsList from '../DeploymentsList'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(data)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  usePostFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useUpdateFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useDeleteFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  }))
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

describe('Pipeline Deployments List', () => {
  test('CD module', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { module: 'cd' }
    })
    const { queryByText, queryAllByText } = render(
      <TestWrapper>
        <DeploymentsList />
      </TestWrapper>
    )

    expect(queryByText('pipeline.noDeploymentText')).toBeTruthy()
    expect(queryAllByText('deploymentsText')).toBeTruthy()
  })

  test('CI module', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { module: 'ci' }
    })
    const { queryByText, queryAllByText } = render(
      <TestWrapper>
        <DeploymentsList />
      </TestWrapper>
    )

    expect(queryByText('pipeline.noBuildsText')).toBeTruthy()
    expect(queryAllByText('buildsText')).toBeTruthy()
  })
})

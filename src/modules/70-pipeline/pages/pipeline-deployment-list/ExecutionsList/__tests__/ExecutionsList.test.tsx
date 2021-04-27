import React from 'react'
import { getByText, render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'

import ExecutionsList from '../ExecutionsList'
import filters from '../../__tests__/filters.json'
import data from '../../__tests__/execution-list.json'

jest.mock('services/pipeline-ng', () => ({
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({}))
}))

describe('<ExecutionsList /> test', () => {
  test('snapshot testing', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ExecutionsList hasFilters={false} pipelineExecutionSummary={data.data.content as PipelineExecutionSummary[]} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('if pipelineExecutionSummary is empty for applied filters then display proper message for no search results found ', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ExecutionsList hasFilters={true} pipelineExecutionSummary={[] as PipelineExecutionSummary[]} />
      </TestWrapper>
    )
    expect(getByText(container, 'noSearchResultsFoundPeriod')).not.toBeNull()
  })

  test('if pipelineExecutionSummary is undefined for applied filters then display proper message for no search results found ', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ExecutionsList hasFilters={true} pipelineExecutionSummary={undefined} />
      </TestWrapper>
    )
    expect(getByText(container, 'noSearchResultsFoundPeriod')).not.toBeNull()
  })
})

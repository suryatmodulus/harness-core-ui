import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import PipelineDetails from '../PipelineDetails'
import { PipelineResponse } from './PipelineDetailsMocks'
jest.mock('services/pipeline-ng', () => ({
  useGetPipelineSummary: jest.fn(() => PipelineResponse)
}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const NOT_PIPELINE_STUDIO_PATH = routes.toPipelineDetail({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})
const PIPELINE_STUDIO_PATH = routes.toPipelineStudio({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

describe('Pipeline Details tests', () => {
  test('render snapshot view for non pipeline studio route', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={NOT_PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const notPipelineStudio = getByTestId('not-pipeline-studio')
    expect(notPipelineStudio).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('pipelineStudio should be rendered pipeline studio is visited', () => {
    const { getByTestId } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const pipelineStudio = getByTestId('pipeline-studio')
    expect(pipelineStudio).toBeTruthy()
  })
})

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

const TEST_PATH = routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const PIPELINE_STUDIO_PATH = routes.toPipelineStudio({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

describe('Pipeline Details tests', () => {
  test('render snapshot view for non pipeline studio route', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
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
    const pipelineStudioDivs = document.getElementsByClassName('pipelineStudio')
    // pipelineStudio class should not be there
    expect(pipelineStudioDivs).toHaveLength(0)
    expect(container).toMatchSnapshot()
  })

  test('pipelineStudio class should be there when pipeline studio is visited', () => {
    render(
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

    const pipelineStudioDivs = document.getElementsByClassName('pipelineStudio')
    expect(pipelineStudioDivs).toHaveLength(1)
  })
})

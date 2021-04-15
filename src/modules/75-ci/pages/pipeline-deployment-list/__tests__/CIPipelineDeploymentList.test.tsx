import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import CIPipelineDeploymentList from '../CIPipelineDeploymentList'

const historyPushMock = jest.fn()
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => ({
    push: historyPushMock
  })
}))

jest.mock('@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList', () => {
  return function CIPipelineDeploymentListComp(props: any) {
    return <button onClick={() => props.onRunPipeline()} id="runPipelineId"></button>
  }
})

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

describe('<CIPipelineDeploymentList /> tests', () => {
  test('call run pipeline', async () => {
    const spyUseHistory = jest.spyOn({ historyPushMock }, 'historyPushMock')

    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'testPip',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineDeploymentList />
      </TestWrapper>
    )

    const projectButtonSel = '#runPipelineId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(spyUseHistory).toBeCalledWith('/account/testAcc/ci/orgs/testOrg/projects/test/pipelines/testPip/runpipeline')

    spyUseHistory.mockClear()
  })
})

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import type { ResponsePagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import PipelineModalList from '../PipelineModalListView'
import mocks from './RunPipelineListViewMocks'

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline1',
  module: 'cd'
}
const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(mocks)), cancel: jest.fn(), loading: false }
  })
}))
const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

describe('PipelineModal List View', () => {
  test('render list view', async () => {
    const { getByTestId, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <PipelineModalList
          onClose={jest.fn()}
          mockData={mocks as UseGetMockData<ResponsePagePMSPipelineSummaryResponse>}
        />
      </TestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    expect(container).toMatchSnapshot()
  })
})

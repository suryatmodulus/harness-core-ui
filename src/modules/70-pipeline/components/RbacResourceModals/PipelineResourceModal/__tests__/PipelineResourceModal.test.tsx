import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import PipelineResourceModal from '../PipelineResourceModal'
import mockData from './pipelineMockData.json'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline1',
  module: 'cd'
}
const mockGetCallFunction = jest.fn()
jest.mock('@common/utils/dateUtils', () => ({
  formatDatetoLocale: (x: number) => x
}))
jest.useFakeTimers()

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(mockData)), cancel: jest.fn(), loading: false }
  })
}))

describe('PipelineModal List View', () => {
  test('render list view', async () => {
    const { getByText, container } = render(
      <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <PipelineResourceModal {...props}></PipelineResourceModal>
      </TestWrapper>
    )
    await waitFor(() => getByText('common.pipeline'))
    jest.runOnlyPendingTimers()

    expect(container).toMatchSnapshot()
  })
})

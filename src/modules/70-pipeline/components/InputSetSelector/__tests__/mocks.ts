import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponsePageInputSetSummaryResponse } from 'services/pipeline-ng'

export const mockInputSetsList: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ol1',
          pipelineIdentifier: 'PipelineId'
        }
      ]
    }
  }
}

export const mockInputSetsListEmpty: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: { content: [] }
  }
}

export const mockInputSetsListError: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  // eslint-disable-next-line
  // @ts-ignore
  error: {
    message: 'error message'
  },
  data: {}
}

export const mockInputSetsListWithGitDetails: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> =
  {
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn(),
    data: {
      correlationId: '',
      status: 'SUCCESS',
      metaData: null as unknown as undefined,
      data: {
        content: [
          {
            identifier: 'inputsetwithgit',
            inputSetType: 'INPUT_SET',
            name: 'inputsetwithgit',
            pipelineIdentifier: 'PipelineId',
            gitDetails: {
              repoIdentifier: 'repo',
              branch: 'branch'
            }
          }
        ]
      }
    }
  }

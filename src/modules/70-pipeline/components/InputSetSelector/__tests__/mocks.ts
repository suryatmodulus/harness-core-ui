/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponsePageInputSetSummaryResponse } from 'services/pipeline-ng'
import type { InputSetValue } from '../utils'

export const mockInputSetsValue: InputSetValue[] = [
  {
    type: 'INPUT_SET',
    value: 'input1',
    label: 'input1',
    gitDetails: {
      repoIdentifier: 'satyamgitsync',
      branch: 'main'
    }
  }
]

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

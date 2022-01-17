/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import { useGetPipelineList } from 'services/pipeline-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { ResponsePagePMSPipelineSummaryResponse, Failure } from 'services/pipeline-ng'

interface GetPipelinesProps {
  accountIdentifier: string
  lazy: boolean
  projectIdentifier: string
  orgIdentifier: string
  module: Module
  size?: number
}

interface GetPipelinesReturns {
  data: ResponsePagePMSPipelineSummaryResponse | null
  loading: boolean
  refetch: (props?: any) => Promise<void> | undefined
  error: GetDataError<Failure | Error> | null
}

export function useGetPipelines({
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  module,
  lazy = false,
  size
}: GetPipelinesProps): GetPipelinesReturns {
  const { data, loading, refetch, error } = useMutateAsGet(useGetPipelineList, {
    body: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      module,
      size
    },
    lazy
  })

  return {
    data,
    loading,
    refetch,
    error
  }
}

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

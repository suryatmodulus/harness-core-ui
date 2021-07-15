import React from 'react'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'

import type { NgPipeline, PipelineInfoConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse, Failure } from 'services/pipeline-ng'
import { useMutateAsGet } from '@common/hooks'
import type { UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import { useCreateVariables } from 'services/pipeline-ng'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'

export interface PipelineVariablesData {
  variablesPipeline: NgPipeline
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
}

export const PipelineVariablesContext = React.createContext<PipelineVariablesData>({
  variablesPipeline: { name: '', identifier: '' },
  metadataMap: {},
  error: null,
  initLoading: true,
  loading: false
})

export function usePipelineVariables(): PipelineVariablesData {
  return React.useContext(PipelineVariablesContext)
}

export function PipelineVariablesContextProvider(
  props: React.PropsWithChildren<{ pipeline: PipelineInfoConfig }>
): React.ReactElement {
  const { pipeline: originalPipeline } = props
  const [{ variablesPipeline, metadataMap }, setPipelineVariablesData] = React.useState<
    Pick<PipelineVariablesData, 'metadataMap' | 'variablesPipeline'>
  >({
    variablesPipeline: { name: '', identifier: '' },
    metadataMap: {}
  })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelinePathProps>()

  const { data, error, initLoading, loading } = useMutateAsGet(useCreateVariables, {
    body: yamlStringify({ pipeline: originalPipeline }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    debounce: 800
  })

  React.useEffect(() => {
    setPipelineVariablesData({
      metadataMap: data?.data?.metadataMap || {},
      variablesPipeline: parse(data?.data?.yaml || '')?.pipeline || {}
    })
  }, [data?.data?.metadataMap, data?.data?.yaml])

  return (
    <PipelineVariablesContext.Provider value={{ variablesPipeline, metadataMap, error, initLoading, loading }}>
      {props.children}
    </PipelineVariablesContext.Provider>
  )
}

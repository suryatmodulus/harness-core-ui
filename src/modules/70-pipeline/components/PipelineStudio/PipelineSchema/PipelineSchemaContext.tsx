import React from 'react'
import { useParams } from 'react-router-dom'
import { ResponseJsonNode, useGetSchemaYaml } from 'services/pipeline-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useToaster } from '@common/exports'

export interface PipelineSchemaData {
  pipelineSchema: ResponseJsonNode | null
}

const PipelineSchemaContext = React.createContext<PipelineSchemaData>({
  pipelineSchema: null
})

export function usePipelineSchema(): PipelineSchemaData {
  return React.useContext(PipelineSchemaContext)
}

export function PipelineSchemaContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const { showError } = useToaster()
  const { data: pipelineSchema, error } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })
  if (error?.message) {
    showError(error?.message, undefined, 'pipeline.get.yaml.error')
  }
  return <PipelineSchemaContext.Provider value={{ pipelineSchema }}>{props.children}</PipelineSchemaContext.Provider>
}

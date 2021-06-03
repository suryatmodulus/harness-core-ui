import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'

import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { EntityGitDetails, InputSetSummaryResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { PageSpinner } from '@common/components'

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

export default function RunPipelinePage(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const query = useQueryParams<Record<string, string> & GitQueryParams>()

  const { data, refetch, loading } = useGetInputsetYaml({
    planExecutionId: query.executionId,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  React.useEffect(() => {
    if (query.executionId && query.executionId !== null) {
      refetch()
    }
  }, [query.executionId])

  const [inputSetYaml, setInputSetYaml] = React.useState('')
  React.useEffect(() => {
    if (data) {
      ;((data as unknown) as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  const getInputSetSelected = (): InputSetValue[] => {
    if (query && query.inputSetType) {
      const inputSetSelected: InputSetValue[] = [
        {
          type: query.inputSetType as InputSetSummaryResponse['inputSetType'],
          value: query.inputSetValue,
          label: query.inputSetLabel,
          gitDetails: {
            repoIdentifier: query.inputSetRepoIdentifier,
            branch: query.inputSetBranch
          }
        }
      ]
      return inputSetSelected
    }
    return []
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <RunPipelineForm
      pipelineIdentifier={pipelineIdentifier}
      orgIdentifier={orgIdentifier}
      projectIdentifier={projectIdentifier}
      accountId={accountId}
      branch={query.branch}
      repoIdentifier={query.repoIdentifier}
      module={module}
      inputSetYAML={inputSetYaml || ''}
      inputSetSelected={getInputSetSelected()}
    />
  )
}

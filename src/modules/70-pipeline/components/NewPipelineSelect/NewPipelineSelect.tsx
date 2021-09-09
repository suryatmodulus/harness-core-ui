import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import { DropDown } from '@wings-software/uicore'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetPipelineList } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'

export interface NewPipelineSelectProps {
  selectedPipeline?: string
  onPipelineSelect(id: string): void
  defaultSelect?: string
  className?: string
}

export default function NewPipelineSelect(props: NewPipelineSelectProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [query, setQuery] = React.useState('')
  const { getString } = useStrings()

  const { mutate: reloadPipelines, cancel } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      module,
      orgIdentifier,
      searchTerm: query,
      size: 10
    }
  })

  function dummyPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      cancel()
      reloadPipelines({ filterType: 'PipelineSetup' }).then(result => {
        if (result.data?.content) {
          const selectItems = result.data?.content?.map(item => {
            return { label: item.name || '', value: item.identifier || '' }
          }) as SelectOption[]
          resolve(selectItems)
        }
      })
    })
  }

  return (
    <DropDown
      buttonTestId="pipeline-select"
      onChange={option => {
        props.onPipelineSelect(option.value as string)
      }}
      value={props.selectedPipeline}
      items={dummyPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('pipelines')}
    />
  )
}

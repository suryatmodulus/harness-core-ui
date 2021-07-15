import React from 'react'
import { useParams } from 'react-router-dom'
import { Select as BPSelect, ItemRenderer, ItemListRenderer } from '@blueprintjs/select'
import { Button, Menu, Spinner } from '@blueprintjs/core'

import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetPipelineList, PMSPipelineSummaryResponse, PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { String } from 'framework/strings'

import css from './PipelineSelect.module.scss'

export interface PipelineSelectProps {
  selectedPipeline?: string
  onPipelineSelect(id: string): void
  defaultSelect?: string
  className?: string
}

const Select = BPSelect.ofType<PMSPipelineSummaryResponse>()

const itemRenderer: ItemRenderer<PMSPipelineSummaryResponse> = (item, props) => (
  <Menu.Item key={item.identifier} text={item.name} active={props.modifiers.active} onClick={props.handleClick} />
)

export default function PipelineSelect(props: PipelineSelectProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [query, setQuery] = React.useState('')
  const [data, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadPipelines,
    cancel
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      module,
      orgIdentifier,
      searchTerm: query,
      size: 10
    }
  })

  const fetchPipelines = React.useCallback(async () => {
    cancel()
    setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
  }, [reloadPipelines, cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, projectIdentifier, orgIdentifier, module, query])
  function clearSelection(): void {
    props.onPipelineSelect('')
  }

  const selectedValue = props.selectedPipeline
    ? (data?.content || []).find(item => item.identifier === props.selectedPipeline)
    : null

  const itemListRender: ItemListRenderer<PMSPipelineSummaryResponse> = itemListProps => (
    <Menu>
      {loading ? (
        <Spinner size={20} />
      ) : itemListProps.items.length > 0 ? (
        <React.Fragment>
          {selectedValue ? <Menu.Item text="Clear Selection" icon="cross" onClick={clearSelection} /> : null}
          {itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))}
        </React.Fragment>
      ) : (
        <Menu.Item text="No Results" disabled />
      )}
    </Menu>
  )

  function handleSelect(item: PMSPipelineSummaryResponse): void {
    props.onPipelineSelect(item.identifier || '')
  }

  const { defaultSelect, className } = props

  return (
    <Select
      items={data?.content || []}
      itemRenderer={itemRenderer}
      onItemSelect={handleSelect}
      popoverProps={{ minimal: true, wrapperTagName: 'div', targetTagName: 'div' }}
      activeItem={selectedValue}
      resetOnQuery={false}
      query={query}
      onQueryChange={setQuery}
      itemListRenderer={itemListRender}
      className={className}
    >
      <Button className={css.main} rightIcon="chevron-down" data-testid="pipeline-select">
        {selectedValue ? selectedValue?.name : defaultSelect ? defaultSelect : <String stringID="all" />}
      </Button>
    </Select>
  )
}

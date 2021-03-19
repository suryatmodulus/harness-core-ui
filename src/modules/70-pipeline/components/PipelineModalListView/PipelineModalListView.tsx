import React, { useState } from 'react'

import { Button, Text, Color, Container, ExpandingSearchInput } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  PagePMSPipelineSummaryResponse,
  ResponsePagePMSPipelineSummaryResponse,
  useGetPipelineList
} from 'services/pipeline-ng'
import { Page } from '@common/exports'
import { String, useStrings } from 'framework/exports'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import RunPipelineListView from './RunPipelineListView'
import css from './PipelineModalListView.module.scss'

interface PipelineModalListViewProps {
  onClose: () => void
  mockData?: UseGetMockData<ResponsePagePMSPipelineSummaryResponse>
}

export default function PipelineModalListView({ onClose, mockData }: PipelineModalListViewProps): React.ReactElement {
  const [page, setPage] = useState(0)
  const [searchParam, setSearchParam] = React.useState('')
  const { getString } = useStrings()

  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const [data, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const { loading, mutate: reloadPipelines, cancel } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      module,
      orgIdentifier,
      searchTerm: searchParam,
      page,
      size: 5
    },
    mock: mockData
  })

  const fetchPipelines = React.useCallback(async () => {
    cancel()
    setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam])

  const handleSearch = (query: string): void => {
    setSearchParam(query)
  }

  return (
    <>
      <Page.Header
        title={
          <Text color={Color.GREY_800} font="medium">
            <String stringID="runPipelineText" />
          </Text>
        }
        toolbar={
          <Container>
            <Button icon="cross" minimal onClick={onClose} />
          </Container>
        }
      />
      <Page.Body className={css.main} loading={loading}>
        <div className={css.searchContainer}>
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            defaultValue={searchParam}
            className={css.search}
            onChange={handleSearch}
          />
        </div>

        {!data?.content?.length ? (
          <div className={css.noResultSection}>
            <Text font="medium">
              <String stringID="noSearchResultsFoundPeriod" />
            </Text>
          </div>
        ) : null}

        <RunPipelineListView
          data={data}
          refetch={fetchPipelines}
          gotoPage={pageNumber => setPage(pageNumber)}
          hideHeaders={true}
        />
      </Page.Body>
    </>
  )
}

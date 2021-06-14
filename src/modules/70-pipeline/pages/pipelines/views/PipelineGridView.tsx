import { Container, Layout, Pagination } from '@wings-software/uicore'
import React from 'react'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { PipelineCard } from './PipelineCard/PipelineCard'
import css from '../PipelinesPage.module.scss'

interface PipelineGridViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
}

export const PipelineGridView: React.FC<PipelineGridViewProps> = ({
  data,
  gotoPage,
  goToPipelineDetail,
  goToPipelineStudio,
  refetchPipeline
}): JSX.Element => {
  return (
    <>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(item: PMSPipelineSummaryResponse) => (
            <PipelineCard
              pipeline={item}
              goToPipelineDetail={goToPipelineDetail}
              goToPipelineStudio={goToPipelineStudio}
              refetchPipeline={refetchPipeline}
            />
          )}
          keyOf={(item: PMSPipelineSummaryResponse) => item.identifier}
        />
      </Container>
      <Container className={css.pagination}>
        <Pagination
          itemCount={data?.totalElements || /* istanbul ignore next */ 0}
          pageSize={data?.size || /* istanbul ignore next */ 10}
          pageCount={data?.totalPages || /* istanbul ignore next */ -1}
          pageIndex={data?.number || /* istanbul ignore next */ 0}
          gotoPage={gotoPage}
        />
      </Container>
    </>
  )
}

import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { TemplateCard } from '@templates-library/pages/TemplatesList/TemplateCard/TemplateCard'
import type { TemplatesPageSummaryResponse, TemplatesSummaryResponse } from '@templates-library/temporary-mock/model'
import css from './TemplatesGridView.module.scss'

interface TemplateGridViewProps {
  data?: TemplatesPageSummaryResponse | null
  gotoPage: (pageNumber: number) => void
  onSelect: (templateIdentifier: string) => void
}

export const TemplatesGridView: React.FC<TemplateGridViewProps> = (props): JSX.Element => {
  const { data, gotoPage, onSelect } = props

  return (
    <>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(item: TemplatesSummaryResponse) => <TemplateCard template={item} onSelect={onSelect} />}
          keyOf={(item: TemplatesSummaryResponse) => item.identifier}
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

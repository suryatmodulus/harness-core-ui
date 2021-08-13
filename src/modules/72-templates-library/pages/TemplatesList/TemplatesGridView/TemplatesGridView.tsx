import React from 'react'
import cx from 'classnames'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { TemplateCard } from '@templates-library/pages/TemplatesList/TemplateCard/TemplateCard'
import type { TemplatesPageSummaryResponse, TemplateSummaryResponse } from '@templates-library/temporary-mock/model'
import css from './TemplatesGridView.module.scss'

interface TemplateGridViewProps {
  data?: TemplatesPageSummaryResponse | null
  selectedIdentifier?: string
  gotoPage: (pageNumber: number) => void
  onSelect: (template: string) => void
  gridLayoutClass?: string
}

export const TemplatesGridView: React.FC<TemplateGridViewProps> = (props): JSX.Element => {
  const { data, gridLayoutClass, selectedIdentifier, gotoPage, onSelect } = props

  return (
    <>
      <Container className={cx(css.gridLayout, gridLayoutClass)}>
        <Layout.Masonry
          width={500}
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(item: TemplateSummaryResponse) => (
            <TemplateCard
              template={item}
              onSelect={onSelect}
              className={cx({ [css.selectedTemplate]: item.identifier === selectedIdentifier })}
            />
          )}
          keyOf={(item: TemplateSummaryResponse) => item.identifier}
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

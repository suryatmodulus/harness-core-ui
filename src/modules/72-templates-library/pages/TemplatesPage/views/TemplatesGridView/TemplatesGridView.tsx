import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import css from './TemplatesGridView.module.scss'

export const TemplatesGridView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const {
    data,
    selectedIdentifier,
    gotoPage,
    onSelect,
    onPreview,
    onOpenEdit,
    onOpenSettings,
    onDelete,
    onDeleteTemplate
  } = props

  return (
    <Layout.Vertical height={'100%'}>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(template: TemplateSummaryResponse) => (
            <TemplateCard
              template={template}
              onSelect={onSelect}
              isSelected={template.identifier === selectedIdentifier}
              onPreview={onPreview}
              onOpenEdit={onOpenEdit}
              onOpenSettings={onOpenSettings}
              onDelete={onDelete}
              onDeleteTemplate={onDeleteTemplate}
            />
          )}
          keyOf={(item: TemplateSummaryResponse) => item.identifier}
        />
      </Container>
      <Pagination
        itemCount={data?.totalElements || /* istanbul ignore next */ 0}
        pageSize={data?.size || /* istanbul ignore next */ 10}
        pageCount={data?.totalPages || /* istanbul ignore next */ -1}
        pageIndex={data?.number || /* istanbul ignore next */ 0}
        gotoPage={gotoPage}
      />
    </Layout.Vertical>
  )
}

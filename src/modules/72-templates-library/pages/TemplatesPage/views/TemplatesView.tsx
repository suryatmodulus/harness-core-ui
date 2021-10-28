import React from 'react'
import { Views } from '@wings-software/uicore'
import { TemplatesGridView } from '@templates-library/pages/TemplatesPage/views/TemplatesGridView/TemplatesGridView'
import { TemplateListView } from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplateListView'
import type { PageTemplateSummaryResponse, TemplateSummaryResponse } from 'services/template-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'

export interface TemplatesViewProps {
  data?: PageTemplateSummaryResponse
  selectedIdentifier?: string
  gotoPage: (pageNumber: number) => void
  onSelect: (template: TemplateSummaryResponse) => void
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (template: TemplateSummaryResponse) => void
}

export default function TemplatesView(props: TemplatesViewProps & { view: Views }): React.ReactElement {
  const { data, selectedIdentifier, gotoPage, onSelect, onPreview, onOpenEdit, onOpenSettings, onDelete, view } = props

  return (
    <GitSyncStoreProvider>
      {view === Views.GRID ? (
        <TemplatesGridView
          gotoPage={gotoPage}
          data={data}
          onSelect={onSelect}
          selectedIdentifier={selectedIdentifier}
          onPreview={onPreview}
          onOpenEdit={onOpenEdit}
          onOpenSettings={onOpenSettings}
          onDelete={onDelete}
        />
      ) : (
        <TemplateListView
          gotoPage={gotoPage}
          data={data}
          onSelect={onSelect}
          selectedIdentifier={selectedIdentifier}
          onPreview={onPreview}
          onOpenEdit={onOpenEdit}
          onOpenSettings={onOpenSettings}
          onDelete={onDelete}
        />
      )}
    </GitSyncStoreProvider>
  )
}

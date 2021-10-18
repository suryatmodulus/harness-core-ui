import { Layout } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { NGTemplateInfoConfig, TemplateSummaryResponse } from 'services/template-ng'
import css from './TemplatePreview.module.scss'

interface PreviewInterface {
  previewValues?: NGTemplateInfoConfig | TemplateSummaryResponse
  className?: string
}

export const TemplatePreview = (props: PreviewInterface) => {
  const { previewValues, className = '' } = props
  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'center' }}
      className={cx(css.preview, className)}
      padding={{ top: 'huge', bottom: 'huge' }}
    >
      {previewValues && <TemplateCard template={previewValues} />}
    </Layout.Horizontal>
  )
}

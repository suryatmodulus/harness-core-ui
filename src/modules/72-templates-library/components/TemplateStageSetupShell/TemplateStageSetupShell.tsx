import React from 'react'
import cx from 'classnames'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateStageSpecifications } from '@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications'
import css from './TemplateStageSetupShell.module.scss'

export default function TemplateStageSetupShell(): JSX.Element {
  const pipelineContext = usePipelineContext()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    }
  } = pipelineContext

  return (
    <section key={selectedStageId} className={cx(css.setupShell)}>
      <TemplateStageSpecifications />
    </section>
  )
}

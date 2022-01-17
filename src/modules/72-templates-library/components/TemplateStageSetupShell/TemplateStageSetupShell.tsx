/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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

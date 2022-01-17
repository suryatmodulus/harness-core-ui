/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Pagination } from '@wings-software/uicore'
import type { PagePipelineExecutionSummary } from 'services/pipeline-ng'
import { useUpdateQueryParams } from '@common/hooks'

import css from './ExecutionsPagination.module.scss'

export interface ExecutionPaginationProps {
  pipelineExecutionSummary?: PagePipelineExecutionSummary
}

export default function ExecutionPagination({
  pipelineExecutionSummary
}: ExecutionPaginationProps): React.ReactElement {
  const { updateQueryParams } = useUpdateQueryParams<{ page: number }>()

  function gotoPage(index: number): void {
    updateQueryParams({ page: index + 1 })
  }
  return (
    <div className={css.pagination}>
      <Pagination
        pageSize={pipelineExecutionSummary?.size || 0}
        pageIndex={pipelineExecutionSummary?.number}
        pageCount={pipelineExecutionSummary?.totalPages || 0}
        itemCount={pipelineExecutionSummary?.totalElements || 0}
        gotoPage={gotoPage}
      />
    </div>
  )
}

import React from 'react'
import { Button, ButtonGroup } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { String } from 'framework/exports'
// import PipelineSelect from '@pipeline/components/PipelineSelect/PipelineSelect'
// import StatusSelect from '@pipeline/components/StatusSelect/StatusSelect'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
// import { useUpdateQueryParams, useQueryParams } from '@common/hooks'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'

import css from './ExecutionsFilter.module.scss'

interface ExecutionFilterProps {
  onRunPipeline(): void
  isMinimalView?: boolean
}

export interface FilterQueryParams {
  query?: string
  pipeline?: string
  status?: ExecutionStatus | null
}

export default function ExecutionFilter(props: ExecutionFilterProps): React.ReactElement {
  const { module } = useParams<Partial<PipelineType<PipelinePathProps>>>()
  // const { updateQueryParams } = useUpdateQueryParams<FilterQueryParams>()
  // const queryParams = useQueryParams<FilterQueryParams>()

  // function handlePipelineSelect(pipeline: string): void {
  //   updateQueryParams({ pipeline })
  // }

  // function handleStatusSelect(status: ExecutionStatus | null): void {
  //   updateQueryParams({ status })
  // }

  return (
    <div className={css.main}>
      <div className={css.lhs}>
        {props.isMinimalView ? null : (
          <Button icon="run-pipeline" intent="primary">
            <String className={css.runText} stringID="runPipelineText" onClick={props.onRunPipeline} />
          </Button>
        )}
        <div className={cx(css.filterGroup, css.btnGroup)}>
          <String className={css.label} stringID={module === 'ci' ? 'buildsText' : 'deploymentsText'} />
          <ButtonGroup>
            <Button intent="primary">
              <String stringID="all" />
            </Button>
            <Button disabled>My</Button>
          </ButtonGroup>
        </div>
        {/* Hiding quick filters till we get more claity on it's implementation */}
        {/* {module !== 'ci' && (
          <>
            <div className={css.filterGroup}>
              <String className={css.label} stringID="status" />
              <StatusSelect value={queryParams.status} onSelect={handleStatusSelect} />
            </div>
            {pipelineIdentifier ? null : (
              <div className={css.filterGroup}>
                <String className={css.label} stringID="pipelines" />
                <PipelineSelect selectedPipeline={queryParams.pipeline} onPipelineSelect={handlePipelineSelect} />
              </div>
            )}
          </>
        )} */}
      </div>
    </div>
  )
}

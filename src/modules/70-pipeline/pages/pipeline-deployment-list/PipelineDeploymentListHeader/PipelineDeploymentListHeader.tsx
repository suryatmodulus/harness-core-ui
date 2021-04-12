import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonGroup } from '@wings-software/uicore'
import cx from 'classnames'

import { String } from 'framework/exports'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import StatusSelect from '@pipeline/components/StatusSelect/StatusSelect'
import PipelineSelect from '@pipeline/components/PipelineSelect/PipelineSelect'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { GetListOfExecutionsQueryParams } from 'services/pipeline-ng'

import { useFiltersContext } from '../FiltersContext/FiltersContext'
import { ExecutionFilters } from './ExecutionFilters/ExecutionFilters'
import type { QuickStatusParam } from '../types'
import css from './PipelineDeploymentListHeader.module.scss'

export interface FilterQueryParams {
  query?: string
  pipeline?: string
  status?: ExecutionStatus | null
}
export interface PipelineDeploymentListHeaderProps {
  onRunPipeline(): void
}

export function PipelineDeploymentListHeader(props: PipelineDeploymentListHeaderProps): React.ReactElement {
  const { module, pipelineIdentifier } = useParams<Partial<PipelineType<PipelinePathProps>>>()
  const { queryParams } = useFiltersContext()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()

  function handleMyDeployments(): void {
    updateQueryParams({ myDeployments: true })
  }

  function handleAllDeployments(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateQueryParams({ myDeployments: [] as any }) // removes the param
  }

  function handleStatusChange(status?: QuickStatusParam | null): void {
    if (status) {
      updateQueryParams({ status })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ status: [] as any }) // removes the param
    }
  }

  // eslint-disable-next-line no-shadow
  function handlePipelineChange(pipelineIdentifier?: string): void {
    if (pipelineIdentifier) {
      updateQueryParams({ pipelineIdentifier })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ pipelineIdentifier: [] as any }) // removes the param
    }
  }

  return (
    <div className={css.main}>
      <div className={css.lhs}>
        <Button icon="run-pipeline" intent="primary" onClick={props.onRunPipeline}>
          <String className={css.runText} stringID="runPipelineText" />
        </Button>
        <div className={cx(css.filterGroup, css.btnGroup)}>
          <String className={css.label} stringID={module === 'ci' ? 'buildsText' : 'deploymentsText'} />
          <ButtonGroup>
            <Button intent={!queryParams.myDeployments ? 'primary' : 'none'} onClick={handleAllDeployments}>
              <String stringID="all" />
            </Button>
            <Button intent={queryParams.myDeployments ? 'primary' : 'none'} onClick={handleMyDeployments}>
              <String stringID="common.My" />
            </Button>
          </ButtonGroup>
        </div>
        <>
          <div className={css.filterGroup}>
            <String className={css.label} stringID="status" />
            <StatusSelect value={queryParams.status} onSelect={handleStatusChange} />
          </div>
          {pipelineIdentifier ? null : (
            <div className={css.filterGroup}>
              <String className={css.label} stringID="pipelines" />
              <PipelineSelect
                selectedPipeline={queryParams.pipelineIdentifier}
                onPipelineSelect={handlePipelineChange}
              />
            </div>
          )}
        </>
      </div>
      <div className={css.rhs}>
        <ExecutionFilters />
      </div>
    </div>
  )
}

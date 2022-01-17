/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Checkbox, Color, ExpandingSearchInput } from '@wings-software/uicore'

import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import StatusSelect from '@pipeline/components/StatusSelect/StatusSelect'
import NewPipelineSelect from '@pipeline/components/NewPipelineSelect/NewPipelineSelect'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import { useUpdateQueryParams } from '@common/hooks'
import { Page } from '@common/exports'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { GetListOfExecutionsQueryParams } from 'services/pipeline-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

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

const defaultPageNumber = 1

export function PipelineDeploymentListHeader(props: PipelineDeploymentListHeaderProps): React.ReactElement {
  const { module, pipelineIdentifier } = useParams<Partial<PipelineType<PipelinePathProps>>>()
  const { queryParams } = useFiltersContext()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()
  const { getString } = useStrings()
  function handleQueryChange(query: string): void {
    if (query) {
      updateQueryParams({ searchTerm: query })
    } else {
      updateQueryParams({ searchTerm: [] as any }) // removes the param
    }
  }

  function handleMyDeployments(isChecked: boolean): void {
    if (isChecked) {
      updateQueryParams({ myDeployments: true })
    } else {
      updateQueryParams({ myDeployments: [] as any }) // removes the param
    }
  }

  function handleStatusChange(status?: QuickStatusParam | null): void {
    if (status) {
      updateQueryParams({ status, page: defaultPageNumber })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ status: [] as any }) // removes the param
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function handlePipelineChange(pipelineIdentifier?: string): void {
    if (pipelineIdentifier) {
      updateQueryParams({ pipelineIdentifier, page: defaultPageNumber })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ pipelineIdentifier: [] as any }) // removes the param
    }
  }

  return (
    <Page.SubHeader className={css.main}>
      <div className={css.lhs}>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          className={css.runButton}
          onClick={props.onRunPipeline}
          permission={{
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier
            },
            permission: PermissionIdentifier.EXECUTE_PIPELINE,
            options: {
              skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
            }
          }}
          featuresProps={getFeaturePropsForRunPipelineButton(['cd', 'ci'])}
        >
          <String stringID="runPipelineText" />
        </RbacButton>
        <Checkbox
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_800}
          label={getString(module === 'ci' ? 'pipeline.myBuildsText' : 'pipeline.myDeploymentsText')}
          checked={queryParams.myDeployments}
          onChange={e => handleMyDeployments(e.currentTarget.checked)}
          className={cx(css.myDeploymentsCheckbox, { [css.selected]: queryParams.myDeployments })}
        />
        <StatusSelect value={queryParams.status as ExecutionStatus[]} onSelect={handleStatusChange} />
        {pipelineIdentifier ? null : (
          <NewPipelineSelect
            selectedPipeline={queryParams.pipelineIdentifier}
            onPipelineSelect={handlePipelineChange}
          />
        )}
      </div>
      <div className={css.rhs}>
        <ExpandingSearchInput
          defaultValue={queryParams.searchTerm}
          alwaysExpanded
          onChange={handleQueryChange}
          width={200}
          className={css.expandSearch}
        />
        <ExecutionFilters />
      </div>
    </Page.SubHeader>
  )
}

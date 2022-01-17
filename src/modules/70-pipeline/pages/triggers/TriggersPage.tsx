/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks'
import TriggersList from './views/TriggersList'
import type { TriggerDataInterface } from './utils/TriggersListUtils'

// interface TriggerDataInterface {
//   triggerType: string
//   sourceRepo?: string
// }
const TriggersPage: React.FC = (): React.ReactElement => {
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()
  const history = useHistory()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const onNewTriggerClick = (val: TriggerDataInterface): void => {
    const { triggerType, sourceRepo, manifestType, artifactType } = val
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier: 'new', // new is a reserved identifier
        triggerType,
        sourceRepo,
        manifestType,
        artifactType,
        module,
        repoIdentifier,
        branch
      })
    )
  }
  const { getString } = useStrings()

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  useDocumentTitle([pipeline?.data?.name || getString('pipelines'), getString('pipeline.triggers.triggersLabel')])

  return <TriggersList onNewTriggerClick={onNewTriggerClick} repoIdentifier={repoIdentifier} branch={branch} />
}

export default TriggersPage

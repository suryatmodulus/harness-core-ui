import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
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

  useDocumentTitle([getString('pipelines'), getString('pipeline.triggers.triggersLabel')])

  return <TriggersList onNewTriggerClick={onNewTriggerClick} repoIdentifier={repoIdentifier} branch={branch} />
}

export default TriggersPage

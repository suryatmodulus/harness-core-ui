import React from 'react'
import { useParams } from 'react-router-dom'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'

import { useAppStore, useStrings } from 'framework/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'

import routes from '@common/RouteDefinitions'
import PipelineModalListView from '@pipeline/components/PipelineModalListView/PipelineModalListView'
import css from './DeploymentsList.module.scss'

export default function DeploymentsList(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams()
  const { getString } = useStrings()

  const { selectedProject } = useAppStore()
  const project = selectedProject

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} style={{ minWidth: 800, minHeight: 280 }}>
        <PipelineModalListView onClose={hideModal} />
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )
  return (
    <div className={css.main}>
      <div className={css.header}>
        <Breadcrumbs
          links={[
            {
              label: project?.name || '',
              url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module })
            },
            {
              label: getString(module === 'ci' ? 'buildsText' : 'deploymentsText'),
              url: ''
            }
          ]}
        />
        <h2>{getString(module === 'ci' ? 'buildsText' : 'deploymentsText')}</h2>
      </div>
      <div className={css.content}>
        <PipelineDeploymentList onRunPipeline={openModal} />
      </div>
    </div>
  )
}

import React from 'react'
import { useParams } from 'react-router-dom'
import { HarnessDocTooltip, useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'

import routes from '@common/RouteDefinitions'
import PipelineModalListView from '@pipeline/components/PipelineModalListView/PipelineModalListView'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './DeploymentsList.module.scss'

export default function DeploymentsList(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()
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

  const textIdentifier = module === 'ci' ? 'buildsText' : 'deploymentsText'
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
        <div className="ng-tooltip-native">
          <h2 data-tooltip-id={textIdentifier}>{getString(textIdentifier)}</h2>
          <HarnessDocTooltip tooltipId={textIdentifier} useStandAlone={true} />
        </div>
      </div>
      <div className={css.content}>
        <PipelineDeploymentList onRunPipeline={openModal} />
      </div>
    </div>
  )
}

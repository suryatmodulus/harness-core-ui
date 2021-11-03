import React from 'react'
import { useParams } from 'react-router-dom'
import { HarnessDocTooltip, useModalHook } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { PipelineFeatureLimitBreachedBanner } from '@pipeline/factories/PipelineFeatureRestrictionFactory/PipelineFeatureRestrictionFactory'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import PipelineModalListView from '@pipeline/components/PipelineModalListView/PipelineModalListView'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Page } from '@common/exports'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import css from './DeploymentsList.module.scss'

export default function DeploymentsList(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()

  useDocumentTitle([getString('pipelines'), getString('executionsText')])

  const runPipelineDialogProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: { minWidth: 800, minHeight: 280, backgroundColor: 'var(--grey-50)' }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog {...runPipelineDialogProps}>
        <PipelineModalListView onClose={hideModal} />
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )

  const textIdentifier = module === 'ci' ? 'buildsText' : 'deploymentsText'
  const featureIdentifier = module === 'cd' ? FeatureIdentifier.BUILDS : FeatureIdentifier.SERVICES
  const featureNames = undefined
  // !todo add back in when backend ready
  // module === 'ci' ? [FeatureIdentifier.MAX_TOTAL_BUILDS, FeatureIdentifier.MAX_BUILDS_PER_MONTH] : undefined

  return (
    <div className={css.main}>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id={textIdentifier}>{getString(textIdentifier)}</h2>
            <HarnessDocTooltip tooltipId={textIdentifier} useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      ></Page.Header>
      <PipelineFeatureLimitBreachedBanner
        featureIdentifier={featureIdentifier}
        featureNames={featureNames}
        module={module}
      />
      <div className={css.content}>
        <PipelineDeploymentList onRunPipeline={openModal} />
      </div>
    </div>
  )
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { get } from 'lodash-es'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { useStrings } from 'framework/strings'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { setupMode } from '../K8sServiceSpecHelper'
import type { KubernetesServiceInputFormProps } from '../K8sServiceSpecInterface'
import css from '../K8sServiceSpec.module.scss'

const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType },
  factory,
  readonly
}) => {
  const { getString } = useStrings()
  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const isDeploymentTypeSelected = (): string => {
    if (isPropagating) {
      const parentStageId = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', null)
      const parentStage = getStageFromPipeline<DeploymentStageElementConfig>(parentStageId || '')
      return get(parentStage, 'stage.stage.spec.serviceConfig.serviceDefinition.type', null)
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type', null)
  }

  return (
    <div className={css.serviceDefinition}>
      {!!isDeploymentTypeSelected() && (
        <>
          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          >
            <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="deploymentTypeManifests">
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
              <HarnessDocTooltip tooltipId="deploymentTypeManifests" useStandAlone={true} />
            </div>
            <ManifestSelection isPropagating={isPropagating} />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          >
            <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="deploymentTypeArtifacts">
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              <HarnessDocTooltip tooltipId="deploymentTypeArtifacts" useStandAlone={true} />
            </div>
            <ArtifactsSelection isPropagating={isPropagating} />
          </Card>
        </>
      )}

      <div className={css.accordionTitle}>
        <div className={css.tabHeading} id="advanced">
          {getString('advancedTitle')}
        </div>
        <Card className={css.sectionCard} id={getString('variablesText')}>
          <div className={css.tabSubHeading}>{getString('variablesText')}</div>
          <WorkflowVariables
            tabName={DeployTabs.SERVICE}
            formName={'addEditServiceCustomVariableForm'}
            factory={factory as any}
            isPropagating={isPropagating}
            readonly={readonly}
          />
        </Card>
      </div>
    </div>
  )
}

export default KubernetesServiceSpecEditable

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateStage } from '@templates-library/components/TemplateStage/TemplateStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Template',
  type: StageType.Template,
  icon: 'template-library',
  iconColor: 'var(--pipeline-custom-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']): JSX.Element => (
  <TemplateStage
    icon={'template-library'}
    name={_getString('pipeline.pipelineSteps.templateStage')}
    title={_getString('pipeline.pipelineSteps.templateStage')}
    description={_getString('pipeline.pipelineSteps.templateStageDescription')}
    type={StageType.Template}
    isComingSoon={true}
    hoverIcon="template-library"
    isDisabled={!isEnabled}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.Template, getStageAttributes, getStageEditorImplementation)

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import type { StageAttributes, StagesMap } from '../PipelineContext/PipelineContext'

export type StageFactory = (
  isEnabled: boolean,
  getString: UseStringsReturn['getString']
) => React.ReactElement<PipelineStageProps>
export type StageAttributesFactory = (getString: UseStringsReturn['getString']) => StageAttributes

class StagesCollection {
  protected stagesByType = new Map<
    string,
    { stageFactory: StageFactory; stageAttributesFactory: StageAttributesFactory }
  >()

  registerStageFactory(
    stageType: string,
    stageAttributesFactory: StageAttributesFactory,
    stageFactory: StageFactory
  ): void {
    this.stagesByType.set(stageType, { stageFactory, stageAttributesFactory })
  }

  getStage(
    stageType: string,
    isEnabled: boolean,
    getString: UseStringsReturn['getString']
  ): React.ReactElement<PipelineStageProps> | null {
    const stageFactories = this.stagesByType.get(stageType)
    return stageFactories?.stageFactory(isEnabled, getString) || null
  }

  getStageAttributes(stageType: string, getString: UseStringsReturn['getString']): StageAttributes | undefined {
    const stageFactories = this.stagesByType.get(stageType)
    return stageFactories?.stageAttributesFactory(getString)
  }

  getAllStagesAttributes(getString: UseStringsReturn['getString']): StagesMap {
    const stagesMap: StagesMap = {}
    this.stagesByType.forEach((value, key) => {
      stagesMap[key] = value.stageAttributesFactory(getString)
    })
    return stagesMap
  }
}

export const stagesCollection = new StagesCollection()

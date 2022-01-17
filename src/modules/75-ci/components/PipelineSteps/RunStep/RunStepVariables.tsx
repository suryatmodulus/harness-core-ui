/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RunStepData } from './RunStep'
import { flatObject } from '../StepsFlatObject'

export interface RunStepVariablesProps {
  initialValues: RunStepData
  stageIdentifier: string
  onUpdate?(data: RunStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: RunStepData
}

export const RunStepVariables: React.FC<RunStepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

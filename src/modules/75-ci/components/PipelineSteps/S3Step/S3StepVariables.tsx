/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { S3StepData } from './S3Step'
import { flatObject } from '../StepsFlatObject'

export interface S3StepVariablesProps {
  initialValues: S3StepData
  stageIdentifier: string
  onUpdate?(data: S3StepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: S3StepData
}

export const S3StepVariables: React.FC<S3StepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { GCSStepData } from './GCSStep'
import { flatObject } from '../StepsFlatObject'

export interface GCSStepVariablesProps {
  initialValues: GCSStepData
  stageIdentifier: string
  onUpdate?(data: GCSStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: GCSStepData
}

export const GCSStepVariables: React.FC<GCSStepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

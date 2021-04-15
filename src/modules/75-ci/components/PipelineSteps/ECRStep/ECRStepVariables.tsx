import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { ECRStepData } from './ECRStep'
import { flatObject } from '../StepsFlatObject'

export interface ECRStepVariablesProps {
  initialValues: ECRStepData
  stageIdentifier: string
  onUpdate?(data: ECRStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ECRStepData
}

export const ECRStepVariables: React.FC<ECRStepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { GCRStepData } from './GCRStep'
import { flatObject } from '../StepsFlatObject'

export interface GCRStepVariablesProps {
  initialValues: GCRStepData
  stageIdentifier: string
  onUpdate?(data: GCRStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: GCRStepData
}

export const GCRStepVariables: React.FC<GCRStepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

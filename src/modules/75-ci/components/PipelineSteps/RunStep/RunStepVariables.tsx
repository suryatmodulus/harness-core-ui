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

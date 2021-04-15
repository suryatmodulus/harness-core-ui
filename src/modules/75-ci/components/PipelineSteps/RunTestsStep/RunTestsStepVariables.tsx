import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RunTestsStepData } from './RunTestsStep'
import { flatObject } from '../StepsFlatObject'

export interface RunTestsStepVariablesProps {
  initialValues: RunTestsStepData
  stageIdentifier: string
  onUpdate?(data: RunTestsStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: RunTestsStepData
}

export const RunTestsStepVariables: React.FC<RunTestsStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

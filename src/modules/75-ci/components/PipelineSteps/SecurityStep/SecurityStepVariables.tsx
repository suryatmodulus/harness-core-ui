import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SecurityStepData } from './SecurityStep'
import { flatObject } from '../StepsFlatObject'

export interface SecurityStepVariablesProps {
  initialValues: SecurityStepData
  stageIdentifier: string
  onUpdate?(data: SecurityStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SecurityStepData
}

export const SecurityStepVariables: React.FC<SecurityStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

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

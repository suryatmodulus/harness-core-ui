import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SaveCacheS3StepData } from './SaveCacheS3Step'
import { flatObject } from '../StepsFlatObject'

export interface SaveCacheS3StepVariablesProps {
  initialValues: SaveCacheS3StepData
  stageIdentifier: string
  onUpdate?(data: SaveCacheS3StepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SaveCacheS3StepData
}

export const SaveCacheS3StepVariables: React.FC<SaveCacheS3StepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

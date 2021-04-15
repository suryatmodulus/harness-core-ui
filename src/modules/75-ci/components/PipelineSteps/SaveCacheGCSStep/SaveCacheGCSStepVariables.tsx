import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SaveCacheGCSStepData } from './SaveCacheGCSStep'
import { flatObject } from '../StepsFlatObject'

export interface SaveCacheGCSStepVariablesProps {
  initialValues: SaveCacheGCSStepData
  stageIdentifier: string
  onUpdate?(data: SaveCacheGCSStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SaveCacheGCSStepData
}

export const SaveCacheGCSStepVariables: React.FC<SaveCacheGCSStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

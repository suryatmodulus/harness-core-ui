import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RestoreCacheS3StepData } from './RestoreCacheS3Step'
import { flatObject } from '../StepsFlatObject'

export interface RestoreCacheS3StepVariablesProps {
  initialValues: RestoreCacheS3StepData
  stageIdentifier: string
  onUpdate?(data: RestoreCacheS3StepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: RestoreCacheS3StepData
}

export const RestoreCacheS3StepVariables: React.FC<RestoreCacheS3StepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RestoreCacheGCSStepData } from './RestoreCacheGCSStep'
import { flatObject } from '../StepsFlatObject'

export interface RestoreCacheGCSStepVariablesProps {
  initialValues: RestoreCacheGCSStepData
  stageIdentifier: string
  onUpdate?(data: RestoreCacheGCSStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: RestoreCacheGCSStepData
}

export const RestoreCacheGCSStepVariables: React.FC<RestoreCacheGCSStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

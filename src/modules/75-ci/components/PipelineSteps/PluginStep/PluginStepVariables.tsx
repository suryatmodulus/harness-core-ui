import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { PluginStepData } from './PluginStep'
import { flatObject } from '../StepsFlatObject'

export interface PluginStepVariablesProps {
  initialValues: PluginStepData
  stageIdentifier: string
  onUpdate?(data: PluginStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: PluginStepData
}

export const PluginStepVariables: React.FC<PluginStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

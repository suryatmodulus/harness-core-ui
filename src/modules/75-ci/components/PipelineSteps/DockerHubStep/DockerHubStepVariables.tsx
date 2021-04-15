import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { DockerHubStepData } from './DockerHubStep'
import { flatObject } from '../StepsFlatObject'

export interface DockerHubStepVariablesProps {
  initialValues: DockerHubStepData
  stageIdentifier: string
  onUpdate?(data: DockerHubStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: DockerHubStepData
}

export const DockerHubStepVariables: React.FC<DockerHubStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

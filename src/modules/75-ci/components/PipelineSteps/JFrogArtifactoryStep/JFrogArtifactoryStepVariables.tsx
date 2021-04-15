import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { JFrogArtifactoryStepData } from './JFrogArtifactoryStep'
import { flatObject } from '../StepsFlatObject'

export interface JFrogArtifactoryStepVariablesProps {
  initialValues: JFrogArtifactoryStepData
  stageIdentifier: string
  onUpdate?(data: JFrogArtifactoryStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: JFrogArtifactoryStepData
}

export const JFrogArtifactoryStepVariables: React.FC<JFrogArtifactoryStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />

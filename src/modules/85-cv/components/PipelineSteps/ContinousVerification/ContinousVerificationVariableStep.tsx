import React from 'react'
import { pick } from 'lodash-es'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import type { ContinousVerificationData } from './continousVerificationTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ContinousVerificationVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: ContinousVerificationData
  originalData: ContinousVerificationData
}

export function ContinousVerificationVariableStep(props: ContinousVerificationVariableStepProps): React.ReactElement {
  const {
    variablesData = {} as ContinousVerificationData,
    originalData = {} as ContinousVerificationData,
    metadataMap
  } = props
  const data: any = pick(variablesData.spec, ['service', 'env', 'sensitivity', 'duration', 'baseline'])

  return (
    <VariablesListTable
      className={stepCss.topSpacingLarge}
      data={data}
      originalData={originalData?.spec}
      metadataMap={metadataMap}
    />
  )
}

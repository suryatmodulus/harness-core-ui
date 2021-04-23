import React from 'react'
import { pick } from 'lodash-es'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'

import type { ContinousVerificationData } from '../../types'
import type { ContinousVerificationVariableStepProps } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function ContinousVerificationVariableStep(props: ContinousVerificationVariableStepProps): React.ReactElement {
  const {
    variablesData = {} as ContinousVerificationData,
    originalData = {} as ContinousVerificationData,
    metadataMap
  } = props
  const data: any = pick(variablesData.spec.spec, [
    'serviceRef',
    'envRef',
    'sensitivity',
    'duration',
    'baseline',
    'deploymentTag',
    'trafficsplit'
  ])

  return (
    <VariablesListTable
      className={stepCss.topSpacingLarge}
      data={data}
      originalData={originalData?.spec?.spec}
      metadataMap={metadataMap}
    />
  )
}

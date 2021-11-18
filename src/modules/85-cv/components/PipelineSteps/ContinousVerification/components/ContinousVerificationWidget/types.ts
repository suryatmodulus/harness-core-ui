import type { MultiTypeInputType } from '@wings-software/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ContinousVerificationData } from '../../types'

export interface ContinousVerificationWidgetProps {
  initialValues: ContinousVerificationData
  isNewStep?: boolean
  onUpdate?: (data: ContinousVerificationData) => void
  onChange?: (data: ContinousVerificationData) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
}

export interface VerificationJob {
  sensitivity?: string
  baselineVerificationJobInstanceId?: string
  trafficSplitPercentage?: string
  [x: string]: any
}

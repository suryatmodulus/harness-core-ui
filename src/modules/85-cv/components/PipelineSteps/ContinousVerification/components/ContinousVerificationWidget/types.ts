import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ContinousVerificationData } from '../../types'

export interface ContinousVerificationWidgetProps {
  initialValues: ContinousVerificationData
  isNewStep?: boolean
  onUpdate?: (data: ContinousVerificationData) => void
  stepViewType?: StepViewType
}

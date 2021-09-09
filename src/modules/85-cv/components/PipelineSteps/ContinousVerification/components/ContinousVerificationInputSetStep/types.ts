import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ContinousVerificationData } from '../../types'

export interface ContinousVerificationProps {
  initialValues: ContinousVerificationData
  onUpdate?: (data: ContinousVerificationData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ContinousVerificationData
  path?: string
}

export interface serviceAndEnvData {
  serviceIdentifierData: string
  envIdentifierData: string
}

export interface serviceAndEnvDataStage {
  serviceIdentifierFromStage: string
  envIdentifierDataFromStage: string
}

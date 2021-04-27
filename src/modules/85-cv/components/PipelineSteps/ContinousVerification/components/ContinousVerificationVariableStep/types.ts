import type { VariableResponseMapValue } from 'services/pipeline-ng'
import type { ContinousVerificationData } from '../../types'

export interface ContinousVerificationVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: ContinousVerificationData
  originalData: ContinousVerificationData
}

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { LogData } from 'services/cv'
import { LogEvents } from './LogAnalysis.constants'

export const mapClusterType = (type: string): LogData['tag'] => {
  switch (type) {
    case 'KNOWN_EVENT':
      return 'KNOWN'
    case 'UNKNOWN_EVENT':
      return 'UNKNOWN'
    default:
      return
  }
}

export const getClusterTypes = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('pipeline.verification.logs.allEvents'), value: LogEvents.ALL_EVENTS },
    { label: getString('pipeline.verification.logs.knownEvent'), value: LogEvents.KNOWN_EVENT },
    { label: getString('pipeline.verification.logs.unknownEvent'), value: LogEvents.UNKNOWN_EVENT },
    { label: getString('pipeline.verification.logs.unexpectedFrequency'), value: LogEvents.UNEXPECTED_FREQUENCY }
  ]
}

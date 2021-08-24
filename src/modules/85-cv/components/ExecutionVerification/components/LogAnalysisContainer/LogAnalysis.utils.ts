import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { LogData } from 'services/cv'

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
    { label: getString('pipeline.verification.logs.knownEvent'), value: 'KNOWN_EVENT' },
    { label: getString('pipeline.verification.logs.unknownEvent'), value: 'UNKNOWN_EVENT' },
    { label: getString('pipeline.verification.logs.unexpectedFrequency'), value: 'UNEXPECTED_FREQUENCY' }
  ]
}

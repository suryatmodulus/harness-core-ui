import type { SelectOption } from '@wings-software/uicore'

export enum JobTypes {
  BLUE_GREEN = 'Bluegreen',
  TEST = 'Test',
  HEALTH = 'Health',
  CANARY = 'Canary'
}

export enum IdentifierTypes {
  serviceIdentifier = '<+service.identifier>',
  envIdentifier = '<+env.identifier>'
}

export const durationOptions: SelectOption[] = [
  { label: '5 min', value: '5m' },
  { label: '10 min', value: '10m' },
  { label: '15 min', value: '15m' },
  { label: '30 min', value: '30m' }
]

export const trafficSplitPercentageOptions: SelectOption[] = [
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 }
]

export const VerificationSensitivityOptions: SelectOption[] = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' }
]

export const baseLineOptions: SelectOption[] = [{ label: 'Last Successful job run', value: 'LAST' }]

export const cvDefaultValues = {
  identifier: '',
  timeout: '2h',
  spec: {
    verificationJobRef: '',
    type: '',
    spec: {
      sensitivity: '',
      duration: '',
      baseline: '',
      trafficsplit: '',
      serviceRef: '',
      envRef: '',
      deploymentTag: ''
    }
  }
}

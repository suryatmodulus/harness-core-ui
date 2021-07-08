import type { AdditionalInfo } from 'services/cv'

export const VerificationJobType: { [key: string]: AdditionalInfo['type'] } = {
  TEST: 'TEST',
  CANARY: 'CANARY',
  BLUE_GREEN: 'BLUE_GREEN',
  HEALTH: 'HEALTH'
}

export enum HealthSourcesType {
  AppDynamics = 'AppDynamics',
  NewRelic = 'NewRelic',
  Prometheus = 'Prometheus',
  Stackdriver = 'Stackdriver',
  StackdriverLog = 'StackdriverLog'
}

export const appId = '_ia5NKUCSoytYrZJMM15mQ' //t0-jbpLoR7S2BTsNfsk4Iw'

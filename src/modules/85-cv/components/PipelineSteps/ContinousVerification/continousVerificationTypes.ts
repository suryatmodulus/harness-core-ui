import type { SelectOption } from '@wings-software/uicore'
import type { StepElementConfig } from 'services/cd-ng'

export interface ContinousVerificationData extends StepElementConfig {
  spec: {
    verificationJobRef?: SelectOption | string
    type?: string
    spec?: spec
  }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface spec {
  sensitivity?: SelectOption | string
  duration?: SelectOption | string
  trafficsplit?: SelectOption | string
  baseline?: SelectOption | string
  serviceRef?: string
  envRef?: string
  deploymentTag?: string
  [x: string]: any
}

export interface ContinousVerificationFormData extends StepElementConfig {
  spec: {
    verificationJobRef?: SelectOption | string
    type?: string
    spec?: spec
  }
}

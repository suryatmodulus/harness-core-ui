import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface MapQueriesToHarnessServiceLayoutProps {
  // TODO refctor this
  formikProps: any
  connectorIdentifier: any
  onChange: (name: string, value: string | SelectOption) => void
}

import type { FormikProps } from 'formik'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'

export interface MonitoredServiceProps {
  formik: FormikProps<ContinousVerificationData>
}

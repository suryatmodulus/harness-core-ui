import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { Failure } from 'services/cd-ng'
import type { VerificationJobDTO } from 'services/cv'

export interface ContinousVerificationWidgetPanelsProps {
  isNewStep?: boolean
  formik: FormikProps<ContinousVerificationData>
  jobContents: VerificationJobDTO[] | undefined
  loading: boolean
  error: GetDataError<Failure | Error> | null
}

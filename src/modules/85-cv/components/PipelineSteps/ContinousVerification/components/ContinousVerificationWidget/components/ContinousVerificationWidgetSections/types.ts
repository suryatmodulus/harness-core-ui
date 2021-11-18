import type { FormikProps } from 'formik'
import type { MultiTypeInputType } from '@wings-software/uicore'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface ContinousVerificationWidgetSectionsProps {
  isNewStep?: boolean
  formik: FormikProps<ContinousVerificationData>
  stepViewType?: StepViewType
  allowableTypes: MultiTypeInputType[]
}

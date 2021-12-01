import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import type { CreateSLOEnum } from '../CreateSLOForm/CreateSLO.constants'
import type { SLOForm } from '../CreateSLOForm/CreateSLO.types'

export interface NavButtonsProps {
  selectedTabId: CreateSLOEnum
  setSelectedTabId: (tabId: CreateSLOEnum) => void
  getString: UseStringsReturn['getString']
  formikProps: FormikProps<SLOForm>
}

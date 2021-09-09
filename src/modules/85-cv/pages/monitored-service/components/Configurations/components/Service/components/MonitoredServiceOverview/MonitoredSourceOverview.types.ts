import type { FormikProps } from 'formik'
import type { MonitoredServiceForm } from '../../Service.types'

export type MonitoredServiceOverviewProps = {
  isEdit?: boolean
  formikProps: FormikProps<MonitoredServiceForm>
}

import type { FormikProps } from 'formik'
import type { MonitoredServiceDTO } from 'services/cv'
import type { MonitoredServiceForm } from '../../Service.types'

export type MonitoredServiceOverviewProps = {
  isEdit?: boolean
  formikProps: FormikProps<MonitoredServiceForm>
  onChangeMonitoredServiceType?: (type: MonitoredServiceDTO['type']) => void
}

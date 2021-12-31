import type { FormikProps } from 'formik'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface MapMetricsToServicesInterface {
  formikProps: FormikProps<MapCustomHealthToService | undefined>
  mappedMetrics: Map<string, MapCustomHealthToService>
  selectedMetric: string
}

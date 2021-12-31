import type { TimeSeriesSampleDTO } from 'services/cv'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface MetricChartsValueInterface {
  formikValues: MapCustomHealthToService | undefined
  formikSetFieldValue: any
  isQueryExecuted: boolean
  recordsData: TimeSeriesSampleDTO | undefined
  isSelectingJsonPathDisabled: boolean
}

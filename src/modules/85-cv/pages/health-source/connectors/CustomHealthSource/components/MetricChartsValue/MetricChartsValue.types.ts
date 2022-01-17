import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface MetricChartsValueInterface {
  formikValues: MapCustomHealthToService | undefined
  formikSetFieldValue: any
  isQueryExecuted: boolean
  recordsData: Record<string, unknown> | undefined
  isSelectingJsonPathDisabled: boolean
}

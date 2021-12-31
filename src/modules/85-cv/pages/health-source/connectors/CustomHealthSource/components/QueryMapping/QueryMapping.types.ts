import type { TimeSeriesSampleDTO } from 'services/cv'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface QueryMappingInterface {
  formikSetFieldValue: any
  formikValues: MapCustomHealthToService | undefined
  connectorIdentifier: string
  onFetchRecordsSuccess: (data: { [key: string]: { [key: string]: any } }) => void
  isQueryExecuted: boolean
  recordsData: TimeSeriesSampleDTO | undefined
  setLoading: (value: boolean) => void
}

import type { Column } from 'react-table'

export interface ChangesTableInterface {
  startTime: number
  endTime: number
  hasChangeSource: boolean
  serviceIdentifier: string | string[]
  environmentIdentifier: string | string[]
  dynColumns?: Column<any>[]
  dynData?: any
  pagination?: {
    pageSize: number
    pageIndex: number
    pageCount: number
    itemCount: number
    gotoPage: any
  }
}

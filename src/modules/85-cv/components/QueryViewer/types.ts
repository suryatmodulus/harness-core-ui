import { IDrawerProps, Position } from '@blueprintjs/core'

import type { TimeSeriesSampleDTO } from 'services/cv'
import type { RecordsProps } from '../Records/types'

export interface QueryViewerProps {
  isManualQuery?: boolean
  className?: string
  records?: TimeSeriesSampleDTO[]
  loading: boolean
  error: any
  query: string
  isQueryExecuted?: boolean
  postFetchingRecords?: () => void
  fetchRecords: () => void
}

export interface QueryViewDialogProps extends RecordsProps {
  onHide: () => void
  isManualQuery?: boolean
  query?: string
  fetchRecords: () => void
  isOpen: boolean
}

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: false,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '50%'
}

import { IDrawerProps, Position } from '@blueprintjs/core'
import type { TextAreaProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import type { TimeSeriesSampleDTO } from 'services/cv'
import type { RecordsProps } from '../Records/types'

export interface QueryContentProps {
  handleFetchRecords: () => void
  query?: string
  loading?: boolean
  isDialogOpen?: boolean
  onEditQuery?: () => void
  textAreaProps?: TextAreaProps['textArea']
  textAreaName?: string
  onClickExpand: (isOpen: boolean) => void
}

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
  queryNotExecutedMessage?: string
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

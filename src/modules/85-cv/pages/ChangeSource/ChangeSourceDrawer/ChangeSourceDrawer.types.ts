import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type { ChangeSourceDTO, PagerDutyChangeSourceSpec } from 'services/cv'

export interface UpdatedChangeSourceDTO extends Omit<ChangeSourceDTO, 'spec'> {
  spec: PagerDutyChangeSourceSpec
}

export interface ChangeSoureDrawerInterface {
  isEdit: boolean
  rowdata: UpdatedChangeSourceDTO
  tableData: UpdatedChangeSourceDTO[]
  onSuccess: (value: UpdatedChangeSourceDTO[]) => void
  hideDrawer?: () => void
}
export interface CardSelectOption extends Item {
  category?: string
  string?: string
}

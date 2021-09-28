import type { ChangeSourceDTO } from 'services/cv'
import type { ChangeSoureDrawerInterface } from '../ChangeSourceDrawer/ChangeSourceDrawer.types'

export interface ChangeSourceTableInterface {
  value: Array<ChangeSourceDTO>
  onEdit: (val: ChangeSoureDrawerInterface) => void
  onSuccess: (value: ChangeSourceDTO[]) => void
}

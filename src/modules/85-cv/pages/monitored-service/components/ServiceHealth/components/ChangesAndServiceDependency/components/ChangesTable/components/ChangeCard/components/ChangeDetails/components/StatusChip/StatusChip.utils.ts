import { ChangeStatus, NoStatusColorData, SuccessColorData, TriggredColorData } from './StatusChip.constants'

export const getColorByStatus = (status?: string) => {
  switch (status) {
    case ChangeStatus.TRIGGRED:
      return TriggredColorData
    case ChangeStatus.SUCCESS:
      return SuccessColorData
    default:
      return NoStatusColorData
  }
}

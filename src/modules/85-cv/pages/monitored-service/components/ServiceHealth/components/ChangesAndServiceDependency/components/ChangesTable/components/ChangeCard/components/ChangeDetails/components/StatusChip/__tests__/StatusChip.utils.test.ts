import { ChangeStatus, TriggredColorData, SuccessColorData, NoStatusColorData } from '../StatusChip.constants'
import { getColorByStatus } from '../StatusChip.utils'

describe('Validate Utils', () => {
  test('should getColorByStatus', () => {
    expect(getColorByStatus(ChangeStatus.TRIGGRED)).toEqual(TriggredColorData)
    expect(getColorByStatus(ChangeStatus.SUCCESS)).toEqual(SuccessColorData)
    expect(getColorByStatus()).toEqual(NoStatusColorData)
  })
})

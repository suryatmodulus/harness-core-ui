import type { ChangeSourceDTO } from 'services/cv'
import type { RowData } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { deleteHealthSource } from '../HealthSourceTable.utils'
import {
  selectedRow,
  changeSource,
  tableData,
  onDleteWithChangeSource,
  onDeleteWithOutChangeSource
} from './HealthSourceTable.mock'

describe('Validate Healthsource table Utils', () => {
  test('should validate deleteHealthSource', () => {
    // Delet healthsource when we have one change source
    expect(
      deleteHealthSource(selectedRow as RowData, changeSource as ChangeSourceDTO[], tableData as RowData[])
    ).toEqual(onDleteWithChangeSource)

    // Delet healthsource when we have no change source
    expect(deleteHealthSource(selectedRow as RowData, [] as ChangeSourceDTO[], tableData as RowData[])).toEqual(
      onDeleteWithOutChangeSource
    )
  })
})

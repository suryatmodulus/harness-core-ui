import { createHealthsourceList } from '../CustomiseHealthSource.utils'
import { RowData, healthSourcesPayload } from './CustomiseHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateHealthsourceList', () => {
    // Creating new healthsource
    expect(createHealthsourceList({ healthSourceList: [] }, healthSourcesPayload)).toEqual([healthSourcesPayload])

    healthSourcesPayload.name = 'Splunk dev 14'
    RowData.healthSourceList[1].name = 'Splunk dev 14'
    // Updating existing healthsource
    expect(createHealthsourceList(RowData, healthSourcesPayload)).toEqual([...RowData.healthSourceList])
  })
})

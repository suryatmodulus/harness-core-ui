/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createOpenHealthSourceTableProps } from '../HealthSourceTableContainer.utils'
import { editModeProps, createModeProps } from './HealthSourceTableContainer.mock'

describe('Validate util function ', () => {
  test('createOpenHealthSourceTableProps', () => {
    expect(createOpenHealthSourceTableProps({ ...createModeProps } as any)).toEqual({
      environmentRef: createModeProps.formik.values.environmentRef,
      isEdit: createModeProps.isEdit,
      monitoredServiceRef: {
        identifier: createModeProps.formik.values.identifier,
        name: createModeProps.formik.values.name
      },
      monitoredServiceType: createModeProps.formik.values.type,
      rowData: createModeProps.rowData,
      serviceRef: createModeProps.formik.values.serviceRef,
      tableData: createModeProps.tableData
    })
    expect(createOpenHealthSourceTableProps({ ...editModeProps } as any)).toEqual({
      environmentRef: editModeProps.formik.values.environmentRef,
      isEdit: editModeProps.isEdit,
      monitoredServiceRef: {
        identifier: editModeProps.formik.values.identifier,
        name: editModeProps.formik.values.name
      },
      monitoredServiceType: editModeProps.formik.values.type,
      rowData: editModeProps.rowData,
      serviceRef: editModeProps.formik.values.serviceRef,
      tableData: editModeProps.tableData
    })
  })
})

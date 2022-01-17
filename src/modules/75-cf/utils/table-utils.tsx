/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps } from 'react-table'

export function withTableData<Data extends Record<any, any>, T>(
  mapDataToProps: (data: CellProps<Data>) => T
): (Comp: React.FC<T>) => React.FC<CellProps<Data>> {
  return (Comp: React.FC<T>) => (cellProps: CellProps<Data>) => <Comp {...mapDataToProps(cellProps)} />
}

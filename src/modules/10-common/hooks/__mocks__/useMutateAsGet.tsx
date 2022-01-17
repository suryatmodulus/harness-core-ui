/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

export function useMutateAsGet(useMutateWrapper: any): any {
  const [data, setData] = React.useState({})
  const { cancel = jest.fn(), loading = false, mutate = jest.fn(() => Promise.resolve({})) } = useMutateWrapper() || {}

  async function loadData(): Promise<void> {
    const newData = await mutate()

    setData(newData)
  }

  React.useEffect(() => {
    loadData()
  }, [])

  return { data, loading, initLoading: false, cancel, refetch: jest.fn(), error: null }
}

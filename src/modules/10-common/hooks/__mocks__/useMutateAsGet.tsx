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

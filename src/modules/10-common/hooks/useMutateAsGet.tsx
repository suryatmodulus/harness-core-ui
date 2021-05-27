/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseMutateProps, UseMutateReturn, MutateMethod } from 'restful-react'
import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react'
// eslint-disable-next-line no-restricted-imports
import type { Cancelable, DebounceSettings } from 'lodash' // only type imports
import { debounce, identity } from 'lodash-es'

import { shouldShowError } from '../utils/errorUtils'
import { useDeepCompareEffect } from './useDeepCompareEffect'

const isCancellable = <T extends (...args: any[]) => any>(func: T): func is T & Cancelable => {
  return typeof (func as any).cancel === 'function' && typeof (func as any).flush === 'function'
}

export type WrappedUseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams> = Omit<
  UseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams>,
  'path' | 'verb'
> & {
  lazy?: boolean
  body: TRequestBody
  debounce?:
    | {
        wait?: number
        options: DebounceSettings
      }
    | boolean
    | number
} & any // TODO: Add correct types here

type UseMutateWrapper<TData, TError, TQueryParams, TRequestBody, TPathParams> = (
  props: WrappedUseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams>
) => UseMutateReturn<TData, TError, TRequestBody, TQueryParams, TPathParams>

export interface UseMutateAsGetReturn<
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = unknown
> {
  data: TData | null
  initLoading: boolean
  loading: boolean
  error: TError | null
  cancel(): void
  refetch(props?: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>): Promise<void>
}

async function _fetchData<TData, TError, TQueryParams, TRequestBody, TPathParams>(
  mutate: MutateMethod<TData, TQueryParams, TRequestBody, TPathParams>,
  props: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>,
  setInitLoading: Dispatch<SetStateAction<boolean>>,
  setData: Dispatch<SetStateAction<TData | null>>
): Promise<void> {
  const data = await mutate(props.body, {
    queryParams: props.queryParams,
    pathParams: props.pathParams
  })
  setInitLoading(false)
  setData(data)
}

export function useMutateAsGet<
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = unknown
>(
  useMutateWrapper: UseMutateWrapper<TData, TError, TRequestBody, TQueryParams, TPathParams>,
  props: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>
): UseMutateAsGetReturn<TData, TError, TQueryParams, TRequestBody, TPathParams> {
  const [data, setData] = useState<TData | null>(null)
  const [initLoading, setInitLoading] = useState(!props.lazy)
  const [error, setError] = useState<TError | null>(null)
  const { mutate, loading, cancel } = useMutateWrapper(props)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    typeof props.debounce === 'object'
      ? debounce(_fetchData, props.debounce.wait, props.debounce.options)
      : typeof props.debounce === 'number'
      ? debounce(_fetchData, props.debounce)
      : props.debounce
      ? debounce(_fetchData)
      : _fetchData,
    [props.debounce]
  )

  // Cancel fetchData on unmount (if debounce)
  useEffect(() => (isCancellable(fetchData) ? () => fetchData.cancel() : undefined), [fetchData])

  useDeepCompareEffect(() => {
    if (!props.lazy && !props.mock) {
      try {
        fetchData(mutate, props, setInitLoading, setData).then(identity, e => {
          if (shouldShowError(e)) setError(e)
        })
      } catch (e) {
        if (shouldShowError(e)) {
          setError(e)
        }
      }
    }

    return () => {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.lazy, props.body, props.queryParams, props.pathParams, props.base, props.mock])

  return {
    data,
    initLoading,
    loading,
    error,
    cancel,
    refetch: newProps => fetchData(mutate, newProps || props, setInitLoading, setData)
  }
}

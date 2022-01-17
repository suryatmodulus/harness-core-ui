/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import { useGetEnvironment } from 'services/cd-ng'
import { useLocalStorage } from '@common/hooks'
import { CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV } from '@cf/utils/CFUtils'

export interface UseSyncedEnvironmentProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
}

export const useSyncedEnvironment = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  environmentIdentifier
}: UseSyncedEnvironmentProps) => {
  const [environment, setEnvironment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const { loading, data, error, refetch } = useGetEnvironment({
    environmentIdentifier,
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    if (data?.data) {
      setEnvironment({ label: data.data.name as string, value: data.data.identifier as string })
    }
  }, [data])

  return {
    environment,
    setEnvironment,
    data,
    loading,
    error,
    refetch
  }
}

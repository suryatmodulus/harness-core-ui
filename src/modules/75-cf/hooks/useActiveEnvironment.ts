/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useQueryParams } from '@common/hooks'

const useActiveEnvironment = (): {
  activeEnvironment: string
  withActiveEnvironment: (url: string, envOverride?: string) => string
} => {
  const activeEnvironment = useQueryParams<Record<string, string>>()?.activeEnvironment || ''

  const withActiveEnvironment = (url: string, envOverride?: string): string => {
    const env = envOverride ?? activeEnvironment
    if (!env || url.includes(`activeEnvironment=${env}`)) return url

    if (url.includes('activeEnvironment')) return url.replace(/activeEnvironment=[^&]+/gi, `activeEnvironment=${env}`)

    return `${url}${url.includes('?') ? '&' : '?'}activeEnvironment=${env}`
  }

  return {
    activeEnvironment: activeEnvironment !== 'undefined' ? activeEnvironment : '',
    withActiveEnvironment
  }
}

export default useActiveEnvironment

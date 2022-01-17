/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'

/**
 * getEnvString prepends "cf.environments" to given argument
 * Provides base getString in case of needing it
 */
export const useEnvStrings = () => {
  const { getString } = useStrings()
  return {
    getEnvString: (key: string, vars?: Record<string, any>) =>
      getString(`cf.environments.${key}` as StringKeys /* TODO: fix this by using a map */, vars),
    getString
  }
}

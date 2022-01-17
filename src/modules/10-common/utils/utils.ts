/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ModuleName } from 'framework/types/ModuleName'

interface SetPageNumberProps {
  setPage: (value: React.SetStateAction<number>) => void
  pageItemsCount?: number
  page: number
}

export const getModuleIcon = (module: ModuleName): IconName => {
  switch (module) {
    case ModuleName.CD:
      return 'cd-main'
    case ModuleName.CV:
      return 'cv-main'
    case ModuleName.CI:
      return 'ci-main'
    case ModuleName.CE:
      return 'ce-main'
    case ModuleName.CF:
      return 'cf-main'
  }
  return 'nav-project'
}

export const getReference = (scope?: Scope, identifier?: string): string | undefined => {
  switch (scope) {
    case Scope.PROJECT:
      return identifier
    case Scope.ORG:
      return `org.${identifier}`
    case Scope.ACCOUNT:
      return `account.${identifier}`
  }
}

export const setPageNumber = ({ setPage, pageItemsCount, page }: SetPageNumberProps): void => {
  if (pageItemsCount === 0 && page > 0) {
    setPage(page - 1)
  }
}

export const formatCount = (num: number): string => {
  const min = 1e3
  if (num >= min) {
    const units = ['k', 'M', 'B', 'T']
    const order = Math.floor(Math.log(num) / Math.log(1000))
    const finalNum = Math.round(num / 1000 ** order)
    if (finalNum === min && order < units.length) {
      return 1 + units[order]
    }
    return finalNum + units[order - 1]
  }
  return num.toLocaleString()
}

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import type { ModuleName as ModuleNameEnum } from 'framework/types/ModuleName'

type ModuleName = Exclude<keyof typeof ModuleNameEnum, 'COMMON' | 'FRAMEWORK' | 'DX'>

export interface UseCurrentModulePayload {
  module: string | undefined
  isModule: (moduleName: ModuleName) => boolean
}

export default function useCurrentModule(): UseCurrentModulePayload {
  const { module } = useParams<{ module: string }>()
  const isModule = (moduleName: ModuleName): boolean => moduleName.toLowerCase() === module

  return { module, isModule }
}

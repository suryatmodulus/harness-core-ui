/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ModuleName } from 'framework/types/ModuleName'

class ModuleSelectionFactory {
  private readonly moduleSelectionMap: Map<ModuleName, JSX.Element>

  constructor() {
    this.moduleSelectionMap = new Map()
  }

  registerModuleSelection(moduleName: ModuleName, ele: JSX.Element): void {
    this.moduleSelectionMap.set(moduleName, ele)
  }
  getModuleSelectionEle(moduleName: ModuleName): JSX.Element | undefined {
    return this.moduleSelectionMap.get(moduleName)
  }
}

export default new ModuleSelectionFactory()
